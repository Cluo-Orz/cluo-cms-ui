import React, { useEffect, useState } from 'react';
import { ConfigContext, configData } from '../ConfigContext';
import axios from "axios";
import { DynamicApi } from "./DynamicContent";
import {Button, Col, Form, Input, Row, Space, Table, Modal, Popconfirm, Image, Divider} from "antd";
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
    const [ButtonActions, setButtonActions] = useState<DynamicApi[] | undefined>(actions.filter(item => item.action === 'Button'));
    const [TextButtonActions, setTextButtonActions] = useState<DynamicApi[] | undefined>(actions.filter(item => item.action === 'TextButton'));
    const [ListInsertData, setListInsertData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListInsertData'));
    const [ListUpdateData, setListUpdateData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListUpdateData'));
    const [ListDeleteData, setListDeleteData] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListDeleteData'));
    const [ListSelectDetail, setListSelectDetail] = useState<DynamicApi | undefined>(actions.find(item => item.action === 'ListSelectDetail'));
    const [size, setSize] = useState<number>(10)
    const [page, setPage] = useState<number>(1)
    const [detailData, setDetailData] = useState<any>(null); // Added detailData state
    const [textButtonData, setTextButtonData] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalText, setModalText] = useState("");
    const [modalTitle, setModalTitle] = useState("确认操作")
    const [form] = Form.useForm();



    useEffect(() => {
        console.log("sync Configs");
        setListSelectData(actions.find(item => item.action === 'ListSelectData'));
        setButtonActions(actions.filter(item => item.action === 'Button'));
        setTextButtonActions(actions.filter(item => item.action === 'TextButton'));
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

                }else if(item.type==='File'){
                    newColumns.push({
                        title: item.displayName,
                        dataIndex: item.name,
                        key: item.name,
                        render: (_: any, record: { dataIndex: React.Key }) =>{
                            return _?(
                                <Image
                                    width={100}
                                    src={_.toString()}
                                />
                            ):_;
                        }
                    });
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
                'X-Client-Cms': 'true'
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

                // @ts-ignore
                listData = listData.map(obj => {
                    const newObj: any = {};
                    for (const key in obj) {
                        if(obj[key]) {
                            newObj[key] = obj[key].toString();
                        }
                    }
                    return newObj;
                });

                console.log(listData)
                // 如果data[i]中，没有id，则向每个元素补充一个id
                if(listData) {
                    listData.forEach((item: any, index: number) => {
                        if (!item.id) {
                            item.id = index;
                        }
                    });
                }
                setListTotal(total);
                setListData(listData);
            });
    };

    const onSearch = (values: any) => {
        setSearchParam(values);
    };



    const searchForm = (ListSelectData: DynamicApi | undefined, ButtonActions: DynamicApi[] | undefined, TextButtonActions: DynamicApi[] | undefined) => {
        if (!ListSelectData || !ListSelectData.params) {
            return null;
        }

        let actionButtons = [(
            <Button type="primary" shape="circle" key={"refreshButton"} onClick={() => syncDataFromRemote(ListSelectData, searchParam)}>
                <SyncOutlined />
            </Button>
        )]

        if(ButtonActions){
            ButtonActions.forEach(buttonAction => {
                actionButtons.push((
                    <Col>
                        <Button type="primary" shape="circle" key={"actionButtons_"+actionButtons.length} onClick={() => {
                            axios({
                                method: buttonAction.method,
                                url: config.dataPath + buttonAction.url,
                                headers: {
                                    'Content-Type': 'application/json;charset=UTF-8',
                                    'X-Client-Cms': 'true'
                                }
                            }).then((response) =>{
                                setModalTitle(buttonAction.name+"执行结果")
                                if (response.status === 200) {
                                    setModalText(response.data?response.data:"执行成功");
                                    syncDataFromRemote(ListSelectData, searchParam);
                                } else {
                                    setModalText("执行失败");
                                }
                                setIsModalOpen(true)
                            })
                        }}>
                            {buttonAction.name}
                        </Button>
                    </Col>
                ))
            })
        }

        if(TextButtonActions){
            TextButtonActions.forEach((buttonAction,index) => {
                actionButtons.push((
                    <Col key={"TextButtonActions_"+index}>
                        <Space.Compact style={{marginBottom: 10}}>
                            <Input value={textButtonData[buttonAction.keyField]} style={{width: 80}} onChange={(e) => {
                                setTextButtonData({
                                    ...textButtonData,
                                    [buttonAction.keyField]: e.target.value
                                })
                            }}></Input>
                            <Button type="primary" shape="default" onClick={() => {
                                console.log( {
                                    [buttonAction.keyField]: textButtonData[buttonAction.keyField]?textButtonData[buttonAction.keyField]:""
                                })
                                axios({
                                    method: buttonAction.method,
                                    url: config.dataPath + buttonAction.url,
                                    headers: {
                                        'Content-Type': 'application/json;charset=UTF-8',
                                        'X-Client-Cms': 'true'
                                    },
                                    params: {
                                        [buttonAction.keyField]: textButtonData[buttonAction.keyField]?textButtonData[buttonAction.keyField]:""
                                    }
                                }).then((response) =>{
                                    setModalTitle(buttonAction.name+"执行结果");
                                    if (response.status === 200) {
                                        setModalText(response.data?response.data:"执行成功");
                                        syncDataFromRemote(ListSelectData, searchParam);
                                    } else {
                                        setModalText("执行失败");
                                    }
                                    setIsModalOpen(true)
                                })
                            }}>
                                {buttonAction.name}
                            </Button>
                        </Space.Compact>
                    </Col>
                ))
            })
        }


        return (
            <Form layout="inline" onFinish={onSearch} style={style} form={form}>
                <Row justify="start" key={1} style={{width: "100%"}}  gutter={16}>
                    {actionButtons}
                </Row>
                <Divider orientation="left"></Divider>
                <Row justify="start" key={2} style={{width: "100%"}} gutter={16}>
                    {
                        ListInsertData && (
                            <Col key={1}>
                                <ContentInsertModal ListInsertData={ListInsertData} ListSelectData={ListSelectData} dataPath={config.dataPath} onRefresh={handleSyncDataFromRemote}/>
                            </Col>
                        )
                    }
                    <Col key={2}>
                        <Button type="primary" htmlType="submit">
                            搜索
                        </Button>
                    </Col>
                    <Col key={3}>
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
                </Row>

            </Form>
        );
    };

    const searchComponent = (ListSelectData: DynamicApi | undefined, ButtonActions: DynamicApi[] | undefined,TextButtonActions : DynamicApi[] | undefined) => {
        if (!ListSelectData) {
            return null;
        }

        return (
            <Space direction="vertical" size="middle" style={{ paddingBottom: 20, minWidth: "100%" }}>
                {searchForm(ListSelectData, ButtonActions, TextButtonActions)}
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
                    <Row justify="start" gutter={16}>
                        <Col key={'modal-detail'}>
                        {ListSelectDetail && (
                            <ContentDetailModal record={record} ListSelectDetail={ListSelectDetail} dataPath={config.dataPath}/>
                        )}
                        </Col>
                        <Col  key={'modal-update'}>
                        {ListUpdateData && (
                            <ContentUpdateModal ListUpdateData={ListUpdateData} record={record} ListSelectDetail={ListSelectDetail} dataPath={config.dataPath} ListSelectData={ListSelectData} onRefresh={handleSyncDataFromRemote}/>
                        )}
                        </Col>
                        <Col key={'modal-delete'}>
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
            {searchComponent(ListSelectData, ButtonActions, TextButtonActions)}
            <Table columns={
                columns
            } dataSource={listData} rowKey={ListSelectData?.keyField?ListSelectData?.keyField:"id"}
            pagination={{ current:page, pageSize: size, total: listTotal, position: ["bottomRight"], onChange: (page, pageSize) =>{
                setPage(page);
                setSize(pageSize)
            }}}/>
            <Modal title={modalTitle} cancelButtonProps={{ style: { display: 'none' } }} open={isModalOpen} onOk={() => {
                setIsModalOpen(false)
            }}>
                {modalText}
            </Modal>
        </div>
    );
};

export default ManageListContent;
