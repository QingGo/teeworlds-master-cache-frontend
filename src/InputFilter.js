import React from "react";
import PropTypes from "prop-types";

import { Button, Input, Layout } from "element-react";
import "element-theme-default";

class InputFilter extends React.Component {
    render() {
        const {
            serverFilter,
            serverFilterHandleChange,
            onClickAdd,
        } = this.props;
        return (
            <div>
                <Layout.Row>
                    <Layout.Col span="6">
                        <Input
                            placeholder="筛选或添加服务器"
                            value={serverFilter}
                            onChange={serverFilterHandleChange}
                        />
                    </Layout.Col>
                    <Layout.Col span="6">
                        <Button type="primary" onClick={onClickAdd}>
                            添加
                        </Button>
                    </Layout.Col>
                </Layout.Row>
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
