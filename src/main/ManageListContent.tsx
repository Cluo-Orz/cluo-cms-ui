import React from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import { DynamicApi } from "./DynamicContent";
import {Button, Input, Space, Table} from "antd";

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
    columns: [];
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
            columns: [],
            ListSelectData: this.props.actions.find(item => item.action='ListSelectData'),
            ListSelectOptions: this.props.actions.find(item => item.action='ListSelectOptions'),
            ListInsertData: this.props.actions.find(item => item.action='ListInsertData'),
            ListUpdateData: this.props.actions.find(item => item.action='ListUpdateData'),
            ListClickButton: this.props.actions.find(item => item.action='ListClickButton'),
        }
    }

    componentDidMount() {
        console.log("componentDidMount")
        this.syncColumns();
        this.syncDataFromRemote(this.state.ListSelectData);
    }

    syncColumns() {
        let columns: any[] = []
        if (this.state.ListSelectOptions) {
            this.state.ListSelectOptions.fields.forEach(
                item => {
                    columns.push({
                        title: item.displayName,
                        dataIndex: item.name,
                        key: item.name,
                    })
                }
            )
        }
        this.setState({
            // @ts-ignore
            columns: columns
        })
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
            this.syncColumns();
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

    private searchComponent(ListSelectData: DynamicApi | undefined) {
        if(!ListSelectData) {
            return null
        }
        return (
            <Space direction="horizontal" size="middle" style={{padding: 4, paddingLeft: 4}}>
                <Space.Compact>
                    <Button type="primary" onClick={() =>this.syncDataFromRemote(this.state.ListSelectData)}>刷新</Button>
                </Space.Compact>
                {
                    ListSelectData.params.map(
                        item => {
                            if (item.type === 'Button') {

                            } else {
                                return (
                                    <Space.Compact>
                                        <Input placeholder={item.displayName} defaultValue={item.defaultValue}
                                               required={item.required}></Input>
                                    </Space.Compact>
                                )
                            }
                        }
                    )
                }
            </Space>
        )
    }

    render() {
        return (
            <div>
                <div>

                    {this.searchComponent(this.state.ListSelectData)}
                </div>
                <div><Table columns={this.state.columns} dataSource={this.state.listData} /></div>
            </div>

        );
    }

}

export default ManageListContent;