import React from "react";

class ServerAddrs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: "",
            error: null,
            isLoaded: false,
            servers: [],
        };
        this.handleChange = (event) => {
            this.setState({ filter: event.target.value });
        };
    }

    componentDidMount() {
        fetch("https://49.232.3.102:10443/api/v1/server_list")
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        servers: result.Data.map(
                            (server) => server.ip + ":" + server.port
                        ),
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
        const { filter, error, isLoaded, servers } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            const filteredservers = servers.filter((server) =>
                server.includes(filter)
            );
            return (
                <div>
                    <input value={filter} onChange={this.handleChange} />
                    <ul>
                        {filteredservers.map((server) => (
                            <li key={server}>{server}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    }
}

export default ServerAddrs;
