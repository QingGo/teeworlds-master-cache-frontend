import React from "react";
import InputFilter from "./InputFilter";

import { Input, Message, Button, Table, Menu, Loading, Pagination } from "element-react";
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
        // 国外服务器体验太差，先不管告警问题了
        this.api_url = "https://49.232.3.102:10443/api/v1/server_list"
        // "https://teeworld-master-cache.herokuapp.com/api/v1/server_list";
        // this.api_url = "http://127.0.0.1:18080/api/v1/server_list";
        const initialState = {
            token: "",
            filter: "",
        };

        // 刷新保持state，但是只希望保持token和filter，
        const oldstate = JSON.parse(localStorage.getItem("state"))
            ? JSON.parse(localStorage.getItem("state"))
            : initialState;

        this.state = {
            token: oldstate.token,
            filter: oldstate.filter,
            page: 1,
            error: null,
            isLoaded: false,
            servers: [],
            // 因为在element-ui的回调现在只知道可以通过index确定是那个服务器
            filteredservers: [],
        };

        this.tokenHandleChange = (event) => {
            this.setState({ token: event });
        };
        this.serverFilterHandleChange = (event) => {
            const filteredservers = this.state.servers.filter((server) =>
                (server.ip + ":" + server.port).includes(event)
            );
            this.setState({ page:1, filter: event, filteredservers: filteredservers });
        };
        this.changePage = (event) => {
            this.setState({ page: event })
        }

        this.onClickAdd.bind(this);
        this.onClickDelete.bind(this);


        // 刷新保持state
        const orginial = this.setState;
        this.setState = function () {
            let arguments0 = arguments[0];
            let arguments1 = () => (
                arguments[1], localStorage.setItem("state", JSON.stringify(this.state))
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
                    }));
                    const filteredservers = servers.filter((server) =>
                        (server.ip + ":" + server.port).includes(
                            this.state.filter
                        )
                    );
                    this.setState({
                        isLoaded: true,
                        servers: servers,
                        filteredservers: filteredservers,
                    });
                    Message.success("共获取" + servers.length + "条服务器信息");
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
            return <Loading text="加载错误，请刷新" fullscreen={true} />;
        } else {
            return (
                <div>
                    {!isLoaded && (
                        <Loading text="拼命加载中" fullscreen={true} />
                    )}
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
                        data={filteredservers.slice((this.state.page-1)*50,this.state.page*50).map((server) => ({
                            serverStringData: server.ip + ":" + server.port,
                        }))}
                        border={true}
                    />
                    <div className="block">
                        <Pagination layout="total, prev, pager, next, jumper" onCurrentChange={this.changePage} total={this.state.filteredservers.length} pageSize={50} currentPage={1} />
                    </div>
                </div>
            );
        }
    }
}

export default App;
