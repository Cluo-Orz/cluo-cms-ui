import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal} from 'antd';
import {DynamicApi} from "./DynamicContent";
import {SettingTwoTone} from "@ant-design/icons";
import axios from "axios";


interface ManageListContentProps {

    ListSelectDetail: DynamicApi | undefined;
    dataPath: string;
    record: any;

}


const ContentDetailModal: React.FC<ManageListContentProps> = ({ListSelectDetail,record,dataPath}) => {
    const [open, setOpen] = useState(false);

    const [detailData ,setDetailData] = useState<any>({})


    const onClickDetail = (ListSelectDetail: DynamicApi | undefined) => {
        if (ListSelectDetail) {
            let keyField = ListSelectDetail.keyField
            if (!keyField) {
                keyField = 'id'
            }
            let data = {}
            // @ts-ignore
            data[keyField] = record[keyField]
            axios({
                method: ListSelectDetail.method,
                url: dataPath + ListSelectDetail.url,
                params: data,
            })
                .then(response => {
                    setDetailData(response.data);
                });
        }
    };

    const showModal = () => {
        onClickDetail(ListSelectDetail)
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
                                <Form.Item label={item.displayName}>
                                    <Input readOnly value={detailData[item.name]} bordered={false} />
                                </Form.Item>
                            </Col>
                        );
                    })}
                </Form>
            </Modal>
        </>
    );
};

export default ContentDetailModal;