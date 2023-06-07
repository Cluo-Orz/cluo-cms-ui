import React from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import { DynamicApi } from "./DynamicContent";

type ConfigType = typeof configData;

interface ManageListContentProps {
    parentReloadTag: number;
    style?: React.CSSProperties;
    config: ConfigType;
    actions: DynamicApi[]
}


interface ManageListContentState {
    listTotal: number,
    reloadTag: boolean;
    listData: [];
    ListSelectData: DynamicApi | undefined,
    ListSelectOptions: DynamicApi | undefined,
    ListInsertData: DynamicApi | undefined,
    ListUpdateData: DynamicApi | undefined,
    ListClickButton: DynamicApi | undefined
}

class ManageListContent extends React.PureComponent<ManageListContentProps, ManageListContentState> {
    constructor(props: ManageListContentProps) {
        super(props);

        console.log("constructor");

        this.state = {
            reloadTag: false,
            listTotal: 0,
            // @ts-ignore
            listData: [],
            ListSelectData: this.props.actions.find(item => item.action='ListSelectData'),
            ListSelectOptions: this.props.actions.find(item => item.action='ListSelectOptions'),
            ListInsertData: this.props.actions.find(item => item.action='ListInsertData'),
            ListUpdateData: this.props.actions.find(item => item.action='ListUpdateData'),
            ListClickButton: this.props.actions.find(item => item.action='ListClickButton'),
        }
    }

    componentDidMount() {
        console.log("componentDidMount")
        this.syncDataFromRemote(this.state.ListSelectData);
    }


    componentDidUpdate(prevProps: ManageListContentProps) {

        const { parentReloadTag } = this.props;
        // 当parentReloadTag与reloadTag不同时，刷新整个组件
        if (parentReloadTag !== prevProps.parentReloadTag) {
            console.log("componentDidUpdate")
            console.log(this.props.actions)
            this.setState({
                ListSelectData: this.props.actions.find(item => item.action='ListSelectData'),
                ListSelectOptions: this.props.actions.find(item => item.action='ListSelectOptions'),
                ListInsertData: this.props.actions.find(item => item.action='ListInsertData'),
                ListUpdateData: this.props.actions.find(item => item.action='ListUpdateData'),
                ListClickButton: this.props.actions.find(item => item.action='ListClickButton'),
            });
            this.syncDataFromRemote(this.props.actions.find(item => item.action='ListSelectData'));
        }
    }

    syncDataFromRemote(param:DynamicApi | undefined) {
        if(!param) {
            return {
                total: 0,
                list: []
            }
        }
        let data = {}
        param.params.filter(item => item.defaultValue).forEach(
            item => {
                // @ts-ignore
                data[item.name] = item.defaultValue
            }
        );


        axios(
            {
                method: param.method,
                url: this.props.config.dataPath+param.url,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: data
            }
        ).then((response) => {
            let listData = []
            let total  = 0
            if (Array.isArray(response.data)) {
                total = response.data.length;
                listData = response.data;
            } else if (typeof response.data === 'object' && response.data.data) {
                total = response.data.total;
                listData = response.data.data;
            }

            this.setState({
                listTotal: total,
                // @ts-ignore
                listData: listData
            });
        });
    }


    render() {
        return (
            <div>{JSON.stringify(this.state.listData)+"   "+ this.state.listTotal}</div>
        );
    }
}

export default ManageListContent;