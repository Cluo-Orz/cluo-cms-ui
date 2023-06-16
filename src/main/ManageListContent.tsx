import React, { useEffect, useState } from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import { DynamicApi } from "./DynamicContent";
import { Button, Col, Form, Input, Row, Space, Table, Modal } from "antd";
import { SyncOutlined, DownOutlined,SettingTwoTone } from "@ant-design/icons";
import ContentUpdateModal from "./ContentUpdateModal";
import ContentDetailModal from "./ContentDetailModal";
import ContentDeleteModal from "./ContentDeleteModal";
import ContentInsertModal from "./ContentInsertModal";

type ConfigType = typeof configData;

interface ManageListContentProps {
    parentReloadTag: number;
    style?: React.CSSProperties;
    config: ConfigType;
    actions: DynamicApi[];
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
    const [size, setSize] = useState<number>(10)
    const [page, setPage] = useState<number>(1)
    const [detailData, setDetailData] = useState<any>(null); // Added detailData state
    const [form] = Form.useForm();



    useEffect(() => {
        console.log("sync Configs");
        setListSelectData(actions.find(item => item.action === 'ListSelectData'));
        setListSelectOptions(actions.find(item => item.action === 'ListSelectOptions'));
        setListInsertData(actions.find(item => item.action === 'ListInsertData'));
        setListUpdateData(actions.find(item => item.action === 'ListUpdateData'));
        setListDeleteData(actions.find(item => item.action === 'ListDeleteData'));
        setListSelectDetail(actions.find(item => item.action === 'ListSelectDetail'));
    }, [parentReloadTag]);

    useEffect(() => {
        console.log("sync Columns")
        syncColumns(actions.find(item => item.action === 'ListSelectData'), actions.find(item => item.action === 'ListSelectDetail'), actions.find(item => item.action === 'ListUpdateData'));
    }, [ListSelectData, ListUpdateData, ListSelectDetail])

    useEffect(() => {
        console.log("sync DataFromRemote")
        syncDataFromRemote(ListSelectData, searchParam);
    }, [columns, searchParam, page])

    const syncColumns = (
        ListSelectData: DynamicApi | undefined,
        ListSelectDetail: DynamicApi | undefined,
        ListUpdateData: DynamicApi | undefined // Add ListUpdateData parameter
    ) => {
        let newColumns: any[] = [];


        setListData([])
        setListTotal(0)

        if (ListSelectData) {
            setPage(ListSelectData.defaultPage)
            setSize(ListSelectData.defaultSize)
            ListSelectData.fields.forEach(item => {
                if(item.type==='Button'){

                }else if(item.type==='Table'){

                }else {
                    newColumns.push({
                        title: item.displayName,
                        dataIndex: item.name,
                        key: item.name,
                    });
                }
            });

            if (ListSelectDetail || ListUpdateData) {
                let detailColumn = renderDetailsButton(ListSelectDetail, ListUpdateData);
                if (detailColumn) {
                    newColumns.push(detailColumn);
                }
            }
        }

        // @ts-ignore
        setColumns(newColumns);
    };

    const handleSyncDataFromRemote = (ListSelectData: DynamicApi | undefined) => {
        syncDataFromRemote(ListSelectData, searchParam)
    }

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
            params:{
                page: page,
                size: size
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
    };



    const searchForm = (ListSelectData: DynamicApi | undefined) => {
        if (!ListSelectData || !ListSelectData.params) {
            return null;
        }

        return (
            <Form layout="inline" onFinish={onSearch} style={style} form={form}>
                <Col flex="40px" key={0}>
                    <Button type="primary" shape="circle" onClick={() => syncDataFromRemote(ListSelectData, searchParam)}>
                        <SyncOutlined />
                    </Button>
                </Col>
                {
                    ListInsertData && (
                        <Col flex="80px" key={1}>
                            <ContentInsertModal ListInsertData={ListInsertData} ListSelectData={ListSelectData} dataPath={config.dataPath} onRefresh={handleSyncDataFromRemote}/>
                        </Col>
                    )
                }
                <Col flex="80px" key={2}>
                    <Button type="primary" htmlType="submit">
                        搜索
                    </Button>
                </Col>
                <Col flex="80px" key={3}>
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
                                    <Input placeholder={item.placeholder} required={item.required} />
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
                {searchForm(ListSelectData)}
            </Space>
        );
    };


    const renderDetailsButton = (ListSelectDetail: DynamicApi | undefined, ListUpdateData: DynamicApi | undefined) => {
        if (ListSelectDetail || ListUpdateData) {
            return {
                title: '操作',
                dataIndex: 'actions',
                key: 'actions',
                // @ts-ignore
                render: (_, record) => (
                    <Row justify="start">
                        <Col span={4} key={'modal-detail'}>
                        {ListSelectDetail && (
                            <ContentDetailModal record={record} ListSelectDetail={ListSelectDetail} dataPath={config.dataPath}/>
                        )}
                        </Col>
                        <Col span={4}  key={'modal-update'}>
                        {ListUpdateData && (
                            <ContentUpdateModal ListUpdateData={ListUpdateData} record={record} ListSelectDetail={ListSelectDetail} dataPath={config.dataPath} ListSelectData={ListSelectData} onRefresh={handleSyncDataFromRemote}/>
                        )}
                        </Col>
                        <Col span={4} key={'modal-delete'}>
                        {ListDeleteData && (
                            <ContentDeleteModal ListDeleteData={ListDeleteData} record={record} ListSelectDetail={ListSelectDetail} dataPath={config.dataPath} ListSelectData={ListSelectData} onRefresh={handleSyncDataFromRemote}/>
                        )}
                        </Col>
                    </Row>
                ),
            };
        }
        return null;
    };

    return (
        <div>
            {searchComponent(ListSelectData)}
            {}
            <Table columns={
                columns
            } dataSource={listData} rowKey={ListSelectData?.keyField?ListSelectData?.keyField:"id"}
            pagination={{ current:page, pageSize: size, total: listTotal, position: ["bottomRight"], onChange: (page, pageSize) =>{
                setPage(page);
                setSize(pageSize)
            }}}/>
        </div>
    );
};

export default ManageListContent;
