import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal} from 'antd';
import {DynamicApi} from "./DynamicContent";
import axios from "axios";
import { DeleteTwoTone,DeleteFilled}  from "@ant-design/icons";
import DynamicFormItem from "./DynamicFormItem";



interface ContentUpdateModalProps {
    ListDeleteData: DynamicApi | undefined;
    ListSelectDetail: DynamicApi | undefined;
    ListSelectData: DynamicApi | undefined;
    dataPath: string;
    record: any;
    onRefresh: Function;

}



const ContentDeleteModal: React.FC<ContentUpdateModalProps> = ({ListDeleteData, ListSelectData,ListSelectDetail,record,dataPath, onRefresh}) => {
    const [open, setOpen] = useState(false);

    const [detailData ,setDetailData] = useState<any>({})

    const handleButtonClick = () => {
        console.log(ListSelectData)
        // 在需要刷新父组件的地方调用回调函数
        onRefresh(ListSelectData);
    };

    const onClickDetail = async () => {
        if (ListSelectDetail) {
            let keyField = ListSelectDetail.keyField
            if (!keyField) {
                keyField = 'id'
            }
            let data = {}
            // @ts-ignore
            data[keyField] = record[keyField]
            try {
                const response = await axios({
                    method: ListSelectDetail.method,
                    url: dataPath + ListSelectDetail.url,
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8',
                    },
                    params: data,
                });
                setDetailData(response.data);
            } catch (error) {
                // 处理请求错误
            }
        }
    }


    const showModal = async () => {
        await onClickDetail()
        console.log(detailData)
        setOpen(true);
    }

    const onClickOk= () => {
        console.log(detailData)
        if (ListDeleteData && ListSelectDetail) {
            let data: any = {}
            data[ListDeleteData.keyField] = detailData[ListSelectDetail.keyField]
            axios({
                method: ListDeleteData.method,
                url: dataPath + ListDeleteData.url,
                params: data,
            })
                .then(response => {
                    setOpen(false)
                    handleButtonClick()
                });
        }
    }



    return (
        <>
            <Button  type={"primary"} danger onClick={showModal}>
                删除
            </Button>
            <Modal
                title={
                <>
                    <DeleteTwoTone/>是否确认删除数据?
                </>
                }
                open={open}
                cancelText={"取消"}
                onOk={() => {
                    onClickOk()
                }}
                onCancel={() => {setOpen(false)}}
                destroyOnClose={true}
                okButtonProps={{
                    type:"primary",
                    danger: true
                }}
                okText= {
                    <>
                        <DeleteFilled />&nbsp;&nbsp;删除
                    </>
                }
            >
                <Form>
                    {ListSelectDetail && ListSelectDetail.fields && ListSelectDetail.fields.map((item) => {
                        return (
                            <Col key={item.name}>
                                <DynamicFormItem data={detailData[item.name]} modified={false
                                    // @ts-ignore
                                } itemConfig={item} onChange={() =>{}}/>
                            </Col>
                        );
                    })}
                </Form>
            </Modal>
        </>
    );
};

export default ContentDeleteModal;