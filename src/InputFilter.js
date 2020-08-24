import React from "react";
import PropTypes from "prop-types";

class InputFilter extends React.Component {
    render() {
        const {
            serverFilter,
            serverFilterHandleChange,
            onClickAdd,
        } = this.props;
        return (
            <div>
                <input value={serverFilter} onChange={serverFilterHandleChange} />
                <button onClick={onClickAdd}>
                    <span role="img" aria-label="add">
                        ➕
                    </span>
                </button>
            </div>
        );
    }
}

InputFilter.propTypes = {
    serverFilter: PropTypes.string,
    serverFilterHandleChange: PropTypes.func,
    onClickAdd: PropTypes.func,
};

export default InputFilter;
