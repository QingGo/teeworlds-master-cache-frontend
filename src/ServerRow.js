import React from "react";
import PropTypes from 'prop-types';



class ServerRow extends React.Component {
    render() {
        const { server, onClickDelete } = this.props;
        return (
            <tr>
                <td>{server.ip+":"+server.port}</td>
                <td>
                    <button onClick={onClickDelete}><span role="img" aria-label="delete">➖</span></button>
                </td>
            </tr>
        );
    }
}

ServerRow.propTypes = {
    server: PropTypes.object,
    onClickDelete: PropTypes.func
};

export default ServerRow;