import React from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import { DynamicApi } from "./DynamicContent";

type ConfigType = typeof configData;

interface DemoContentProps {
    parentReloadTag: number;
    style?: React.CSSProperties;
    config: ConfigType;
    actions: DynamicApi[]
}


interface DemoContentState {
    reloadTag: number;
    contentConfig: {
        // 枚举, 包含ManageListData和StatisticsData
        type: string;
        actions: DynamicApi[];
    }
}

class DemoContent extends React.PureComponent<DemoContentProps, DemoContentState> {
    constructor(props: DemoContentProps) {
        super(props);
        this.state = {
            reloadTag: 0,
            contentConfig: {
                type: '',
                actions: []
            }
        };
    }

    componentDidUpdate(prevProps: DemoContentProps) {
        const { parentReloadTag, actions } = this.props;

        // 当selectedSubSideBar为空时，不刷新组件
        if (!actions) {
            return;
        }

        // 当parentReloadTag与reloadTag不同时，刷新整个组件
        if (parentReloadTag !== prevProps.parentReloadTag) {
            this.setState({ reloadTag: parentReloadTag });

        }
    }


    render() {
        return (
            <div style={this.props.style}/>
        );
    }
}

export default DemoContent;