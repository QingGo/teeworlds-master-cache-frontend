import React from "react";
import ServerRow from "./ServerRow";
import InputFilter from "./InputFilter";
import './App.css';

import { ToastContainer, toast } from "react-toastify";
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
        this.state = {
            token: "增减记录需要输入token",
            filter: "",
            error: null,
            isLoaded: false,
            servers: [],
        };

        this.tokenHandleChange = (event) => {
            this.setState({ token: event.target.value });
        };
        this.serverFilterHandleChange = (event) => {
            this.setState({ filter: event.target.value });
        };

        this.onClickAdd.bind(this);
        this.onClickDelete.bind(this);
    }

    onClickAdd(serverString) {
        if (!validateIpAndPort(serverString)) {
            toast.error("服务器地址格式错误");
            return;
        }
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: this.state.token,
                data: {
                    ip: serverString.split(":")[0],
                    port: parseInt(serverString.split(":")[1]),
                },
            }),
        };
        fetch("https://49.232.3.102:10443/api/v1/server_list", requestOptions)
            .then((res) => res.json())
            .then(
                (result) => {
                    if (result.Code === 0) {
                        toast.success("添加成功");
                        this.state.servers.push({
                            ip: serverString.split(":")[0],
                            port: serverString.split(":")[1],
                        });
                        this.setState({ servers: this.state.servers });
                    } else {
                        toast.error("返回错误：" + result.Message);
                    }
                },
                (error) => {
                    toast.error("请求失败：" + error);
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
        fetch("https://49.232.3.102:10443/api/v1/server_list", requestOptions)
            .then((res) => res.json())
            .then(
                (result) => {
                    if (result.Code === 0) {
                        toast.success("删除成功");
                        this.setState({ servers: this.state.servers.filter(function(value){ return !(value.ip === server.ip && value.port === server.port);}) });
                    } else {
                        toast.error("返回错误：" + result.Message);
                    }
                },
                (error) => {
                    toast.error("请求失败：" + error);
                }
            );
    }

    componentDidMount() {
        fetch("https://49.232.3.102:10443/api/v1/server_list")
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        servers: result.Data.map((server) => ({
                            ip: server.ip,
                            port: server.port,
                        })),
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
        const { token, filter, error, isLoaded, servers } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const filteredservers = servers.filter((server) =>
                (server.ip + ":" + server.port).includes(filter)
            );
            return (
                <div>
                    <input value={token} onChange={this.tokenHandleChange} />
                    <InputFilter
                        serverFilter={filter}
                        serverFilterHandleChange={this.serverFilterHandleChange}
                        onClickAdd={(e) => this.onClickAdd(filter, e)}
                    />
                    <table>
                        <thead>
                            <tr>
                                <th>服务器地址</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredservers.map((server) => (
                                <ServerRow
                                    server={server}
                                    onClickDelete={(e) =>
                                        this.onClickDelete(server, e)
                                    }
                                    key={server.ip + ":" + server.port}
                                />
                            ))}
                        </tbody>
                    </table>
                    <ToastContainer />
                </div>
            );
        }
    }
}

export default App;
