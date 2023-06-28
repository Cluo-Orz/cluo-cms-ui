import React from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import ManageListContent from "./ManageListContent";

type ConfigType = typeof configData;

interface DynamicContentComponentProps {
    parentReloadTag: number;
    className?: string;
    style: React.CSSProperties;
    config: ConfigType;
    barData: {
        selectedSideBarTitle: string;
        selectedSideBar: string;
        selectedTopBarTitle: string;
        selectedTopBar: string;
        selectedSubSideBarTitle: string;
        selectedSubSideBar: string;
    };
}

const apiData = {
    action: '',
    url: '',
    name: '',
    method: '',
    contentType: '',
    keyField: '',
    defaultSize: 10,
    defaultPage: 1,
    fields:[{
        dataUrl: '',
        placeholder: '',
        displayName: '',
        name: '',
        type: '',
        required: false,
        regex: '',
        tips: '',
        fileCount: 0,
        fileName: '',
        fileSuffix: ""
    }],
    params:[{
        dataUrl: '',
        placeholder: '',
        displayName: '',
        fileName: '',
        name: '',
        type: '',
        required: false,
        regex: '',
        defaultValue: '',
        tips: '',
        fileCount: 0,
        fileSuffix: ""
    }],
    props: {
        hasPagination: false
    }
}

export type DynamicApi = typeof apiData;

interface DynamicContentComponentState {
    contentReloadTag: number;
    contentConfig: {
        // 枚举, 包含ManageListData和StatisticsData
        type: string;
        actions: DynamicApi[];
    }
}

class DynamicContentComponent extends React.PureComponent<DynamicContentComponentProps, DynamicContentComponentState> {
    constructor(props: DynamicContentComponentProps) {
        super(props);
        this.state = {
            contentReloadTag: -1,
            contentConfig: {
                type: '',
                actions: []
            }
        };
    }

    componentDidUpdate(prevProps: DynamicContentComponentProps) {
        const { parentReloadTag, barData } = this.props;
        const { selectedSubSideBar } = barData;

        // 当selectedSubSideBar为空时，不刷新组件
        if (!selectedSubSideBar) {
            return;
        }


        if (parentReloadTag !== prevProps.parentReloadTag) {
            this.doUpdate();
        }
    }

    doUpdate() {
        const { barData, config } = this.props;
        const {
            selectedSubSideBar,
            selectedSideBar,
            selectedTopBar
        } = barData;
        // 当selectedSubSideBar为空时，不刷新组件
        if (!selectedSubSideBar) {
            return;
        }

        axios(
            {
                method: 'get',
                url: this.props.config.basePath+"/cms/content/"+selectedTopBar+"/"+selectedSideBar+"/"+selectedSubSideBar,
                headers: {
                    'X-Client-Cms': 'true'
                }
            }
        ).then((response) => {
            this.setState({
                contentConfig: response.data,
                contentReloadTag: Date.now()
            })
        });
    }

    render() {
        if(!this.state.contentConfig.type) {
            return (
                <div style={this.props.style}>not support</div>
            );
        }else if('ManageListData' === this.state.contentConfig.type) {
            return (
                <div style={this.props.style}>
                    <ManageListContent parentReloadTag={this.state.contentReloadTag} config={this.props.config} actions={this.state.contentConfig.actions}/>
                </div>
            );
        }else if('StatisticsData' === this.state.contentConfig.type) {
            return (
                <div style={this.props.style}>not support</div>
            );
        }
    }
}

export default DynamicContentComponent;