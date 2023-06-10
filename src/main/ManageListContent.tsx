import React, {useEffect, useState} from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import { DynamicApi } from "./DynamicContent";
import { Button, Col, Form, Input, Row, Space, Table } from "antd";
import { SyncOutlined, DownOutlined } from "@ant-design/icons";

type ConfigType = typeof configData;

interface ManageListContentProps {
    parentReloadTag: number;
    style?: React.CSSProperties;
    config: ConfigType;
    actions: DynamicApi[];
}

interface ManageListContentState {
    listTotal: number;
    reloadTag: boolean;
    searchParam: {};
    listData: [];
    columns: [];
    ListSelectData: DynamicApi | undefined;
    ListSelectOptions: DynamicApi | undefined;
    ListInsertData: DynamicApi | undefined;
    ListUpdateData: DynamicApi | undefined;
    ListClickButton: DynamicApi | undefined;
}

const ManageListContent: React.FC<ManageListContentProps> = ({ parentReloadTag, style, config, actions }) => {
    const [listTotal, setListTotal] = useState(0);
    const [reloadTag, setReloadTag] = useState(false);
    const [searchParam, setSearchParam] = useState({});
    const [listData, setListData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [ListSelectData, setListSelectData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListSelectData'));
    const [ListSelectOptions, setListSelectOptions] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListSelectOptions'));
    const [ListInsertData, setListInsertData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListInsertData'));
    const [ListUpdateData, setListUpdateData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListUpdateData'));
    const [ListDeleteData, setListDeleteData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListDeleteData'));
    const [ListSelectDetail, setListSelectDetail] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListSelectDetail'));
    const [form] = Form.useForm();

    useEffect(() => {
        console.log("componentDidMount");
        syncColumns(ListSelectData);
        syncDataFromRemote(ListSelectData, searchParam);
    }, []);

    useEffect(() => {
        console.log("componentDidUpdate");
        console.log(actions);
        setListSelectData(actions.find(item => item.action === 'ListSelectData'));
        setListSelectOptions(actions.find(item => item.action === 'ListSelectOptions'));
        setListInsertData(actions.find(item => item.action === 'ListInsertData'));
        setListUpdateData(actions.find(item => item.action === 'ListUpdateData'));
        setListDeleteData(actions.find(item => item.action === 'ListDeleteData'));
        setListSelectDetail(actions.find(item => item.action === 'ListSelectDetail'));
        syncColumns(actions.find(item => item.action === 'ListSelectData'));
        syncDataFromRemote(actions.find(item => item.action === 'ListSelectData'), searchParam);


        console.log(columns)
        console.log(listData)
    }, [parentReloadTag]);

    const syncColumns = (ListSelectData:DynamicApi|undefined) => {
        let newColumns: any[] = [];

        if (ListSelectData) {
            ListSelectData.fields.forEach(item => {
                newColumns.push({
                    title: item.displayName,
                    dataIndex: item.name,
                    key: item.name,
                });
            });
        }

        console.log("ListSelectData ", ListSelectData)
        console.log('syncColumns ', newColumns);
        // @ts-ignore
        setColumns(newColumns);
    };

    const syncDataFromRemote = (param: DynamicApi | undefined, formData: any = {}) => {
        if (!param) {
            return {
                total: 0,
                list: [],
            };
        }

        let data = formData;

        param.params.filter(item => item.defaultValue).forEach(item => {
            if (!data[item.name] && item.defaultValue) {
                data[item.name] = item.defaultValue;
            }
        });

        axios({
            method: param.method,
            url: config.dataPath + param.url,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            data: data,
        })
            .then(response => {
                let listData = [];
                let total = 0;
                if (Array.isArray(response.data)) {
                    total = response.data.length;
                    listData = response.data;
                } else if (typeof response.data === 'object' && response.data.data) {
                    total = response.data.total;
                    listData = response.data.data;
                }
                // 如果data[i]中，没有id，则向每个元素补充一个id
                listData.forEach((item: any, index: number) => {
                    if (!item.id) {
                        item.id = index;
                    }
                });
                console.log(listData)
                setListTotal(total);
                setListData(listData);
            });
    };

    const onSearch = (values: any) => {
        setSearchParam(values);
        syncDataFromRemote(ListSelectData, values);
    };

    const searchForm = (ListSelectData: DynamicApi | undefined) => {
        if (!ListSelectData || !ListSelectData.params) {
            return null;
        }

        return (
            <Form layout="inline" onFinish={onSearch} style={style} form={form}>
                <Col flex="80px" key={0}>
                    <Button type="primary" htmlType="submit">
                        搜索
                    </Button>
                </Col>
                <Col flex="80px" key={1}>
                    <Button onClick={() => form.resetFields()}>
                        重置
                    </Button>
                </Col>
                {ListSelectData.params.map(item => {
                    let res = <div>unknown type</div>;
                    if (item.type === 'Button') {
                        // TODO: Handle Button type
                    } else {
                        res = (
                            <Col key={item.name}>
                                <Form.Item required={item.required} name={item.name} label={item.displayName} rules={[{ pattern: new RegExp(item.regex), message: item.tips }]}>
                                    <Input placeholder={item.placeholder}  required={item.required} />
                                </Form.Item>
                            </Col>
                        );
                    }
                    return res;
                })}
            </Form>
        );
    };

    const searchComponent = (ListSelectData: DynamicApi | undefined) => {
        if (!ListSelectData) {
            return null;
        }

        return (
            <Space direction="vertical" size="middle" style={{ paddingBottom: 20, minWidth: "100%" }}>
                <Space.Compact>
                    <Button type="primary" shape="circle" onClick={() => syncDataFromRemote(ListSelectData, searchParam)}>
                        <SyncOutlined />
                    </Button>
                </Space.Compact>
                {searchForm(ListSelectData)}
            </Space>
        );
    };

    return (
        <div>
            {searchComponent(ListSelectData)}
            <Table columns={columns} dataSource={listData} />
        </div>
    );
};

export default ManageListContent;
