import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal} from 'antd';
import {DynamicApi} from "./DynamicContent";
import {SettingTwoTone} from "@ant-design/icons";
import axios from "axios";
import DynamicFormItem from "./DynamicFormItem";


interface ManageListContentProps {

    ListSelectDetail: DynamicApi | undefined;
    dataPath: string;
    record: any;

}


const ContentDetailModal: React.FC<ManageListContentProps> = ({ListSelectDetail,record,dataPath}) => {
    const [open, setOpen] = useState(false);

    const [detailData ,setDetailData] = useState<any>({})


    const onClickDetail = async (ListSelectDetail: DynamicApi | undefined) => {
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
                        'X-Client-Cms': 'true'
                    },
                    params: data,
                });

                setDetailData(response.data);
            } catch (error) {
                // 处理请求错误
            }
        }
    };

    const showModal = async () => {
        await onClickDetail(ListSelectDetail)
        console.log(detailData)
        setOpen(true);
    };


    return (
        <>
            <Button type="dashed" onClick={showModal}>
                详情
            </Button>
            <Modal
                title="查看详情"
                open={open}
                cancelText={"取消"}
                onOk={() => {setOpen(false)}}
                onCancel={() => {setOpen(false)}}
                destroyOnClose={true}
                okText= "OK"
            >
                <Form >
                    {ListSelectDetail && ListSelectDetail.fields && ListSelectDetail.fields.map((item) => {
                        return (
                            <Col key={item.name}>
                                <DynamicFormItem globalDataUrl={dataPath} data={detailData[item.name]} modified={false
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

export default ContentDetailModal;