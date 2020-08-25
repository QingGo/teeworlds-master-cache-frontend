import React from "react";
import InputFilter from "./InputFilter";

import { Input, Message, Button, Table, Menu } from "element-react";
import "element-theme-default";
import "react-toastify/dist/ReactToastify.css";

function validateIpAndPort(input) {
    var parts = input.split(":");
    var ip = parts[0].split(".");
    var port = parts[1];
    return (
        validateNum(port, 1, 65535) &&
        ip.length === 4 &&
        ip.every(function (segment) {
            return validateNum(segment, 0, 255);
        })
    );
}

function validateNum(input, min, max) {
    var num = +input;
    return num >= min && num <= max && input === num.toString();
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.api_url = "https://teeworld-master-cache.herokuapp.com/api/v1/server_list"
        const initialState = {
            token: "",
            filter: "",
            error: null,
            isLoaded: false,
            servers: [],
            // 因为在element-ui的回调现在只知道可以通过index确定是那个服务器
            filteredservers: [],
        };

        // 刷新保持state
        this.state = JSON.parse(localStorage.getItem("state"))
            ? JSON.parse(localStorage.getItem("state"))
            : initialState;

        this.tokenHandleChange = (event) => {
            this.setState({ token: event });
        };
        this.serverFilterHandleChange = (event) => {
            const filteredservers = this.state.servers.filter((server) =>
                (server.ip + ":" + server.port).includes(event)
            );
            this.setState({ filter: event, filteredservers: filteredservers });
        };

        this.onClickAdd.bind(this);
        this.onClickDelete.bind(this);

        // 刷新保持state
        const orginial = this.setState;
        this.setState = function () {
            let arguments0 = arguments[0];
            let arguments1 = () => (
                arguments[1],
                localStorage.setItem("state", JSON.stringify(this.state))
            );
            orginial.bind(this)(arguments0, arguments1);
        };

        this.columns = [
            {
                label: "服务器地址",
                width: 250,
                fixed: "left",
                prop: "serverStringData",
                align: "center",
            },
            {
                label: "操作",
                width: 120,
                align: "center",
                render: (row, column, index) => {
                    return (
                        <span>
                            <Button
                                type="primary"
                                onClick={(e) =>
                                    this.onClickDelete(
                                        this.state.filteredservers[index],
                                        e
                                    )
                                }
                            >
                                移除
                            </Button>
                        </span>
                    );
                },
            },
        ];
    }

    onClickAdd(serverString) {
        if (!validateIpAndPort(serverString)) {
            Message.error("服务器地址格式错误");
            return;
        }
        const server = {
            ip: serverString.split(":")[0],
            port: parseInt(serverString.split(":")[1]),
        };

        var isIncluded = false;
        this.state.servers.forEach(function (item) {
            if (item.ip === server.ip && item.port === server.port) {
                isIncluded = true;
            }
        });
        if (isIncluded) {
            Message.warning("此服务器已经在列表中");
            return;
        }
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: this.state.token,
                data: server,
            }),
        };
        fetch(this.api_url, requestOptions)
            .then((res) => res.json())
            .then(
                (result) => {
                    if (result.Code === 0) {
                        Message.success("添加成功");
                        this.state.servers.push(server);
                        const filteredservers = this.state.servers.filter(
                            (server) =>
                                (server.ip + ":" + server.port).includes(
                                    this.state.filter
                                )
                        );
                        this.setState({
                            servers: this.state.servers,
                            filteredservers: filteredservers,
                        });
                    } else {
                        Message.error("返回错误：" + result.Message);
                    }
                },
                (error) => {
                    Message.error("请求失败：" + error);
                }
            );
    }

    onClickDelete(server) {
        const requestOptions = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: this.state.token,
                data: {
                    ip: server.ip,
                    port: parseInt(server.port),
                },
            }),
        };
        fetch(this.api_url, requestOptions)
            .then((res) => res.json())
            .then(
                (result) => {
                    if (result.Code === 0) {
                        Message.success("删除成功");
                        const servers = this.state.servers.filter(
                            (_server) => server !== _server
                        );
                        const filteredservers = servers.filter((server) =>
                            (server.ip + ":" + server.port).includes(
                                this.state.filter
                            )
                        );
                        this.setState({
                            servers: servers,
                            filteredservers: filteredservers,
                        });
                    } else {
                        Message.error("返回错误：" + result.Message);
                    }
                },
                (error) => {
                    Message.error("请求失败：" + error);
                }
            );
    }

    componentDidMount() {
        fetch(this.api_url)
            .then((res) => res.json())
            .then(
                (result) => {
                    const servers = result.Data.map((server) => ({
                        ip: server.ip,
                        port: server.port,
                    }))
                    const filteredservers = servers.filter(
                        (server) =>
                            (server.ip + ":" + server.port).includes(
                                this.state.filter
                            )
                    );
                    this.setState({
                        isLoaded: true,
                        servers: servers,
                        filteredservers: filteredservers
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                    });
                }
            );
    }

    render() {
        const { token, filter, error, isLoaded, filteredservers } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    <div>
                        <Menu
                            theme="dark"
                            defaultActive="1"
                            className="el-menu-demo"
                            mode="horizontal"
                        >
                            <Menu.Item index="1">TeeMaster 控制中心</Menu.Item>
                        </Menu>
                    </div>
                    <Input
                        placeholder="增减记录需要输入token"
                        value={token}
                        onChange={this.tokenHandleChange}
                    />
                    <InputFilter
                        serverFilter={filter}
                        serverFilterHandleChange={this.serverFilterHandleChange}
                        onClickAdd={(e) => this.onClickAdd(filter, e)}
                    />
                    <Table
                        columns={this.columns}
                        data={filteredservers.map((server) => ({
                            serverStringData: server.ip + ":" + server.port,
                        }))}
                        border={true}
                    />
                </div>
            );
        }
    }
}

export default App;
