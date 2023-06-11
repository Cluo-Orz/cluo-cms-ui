import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal} from 'antd';
import {DynamicApi} from "./DynamicContent";
import { DeleteTwoTone}  from "@ant-design/icons";
import axios from "axios";



interface ContentUpdateModalProps {
  ListUpdateData: DynamicApi | undefined;
  ListSelectDetail: DynamicApi | undefined;
  ListSelectData: DynamicApi | undefined;
  dataPath: string;
  record: any;
  onRefresh: Function;

  style?: React.CSSProperties;
}



const ContentUpdateModal: React.FC<ContentUpdateModalProps> = ({ListUpdateData, ListSelectData,ListSelectDetail,record,dataPath, onRefresh}) => {
  const [open, setOpen] = useState(false);

  const [detailData ,setDetailData] = useState<any>({})

  const handleButtonClick = () => {
    console.log(ListSelectData)
    // 在需要刷新父组件的地方调用回调函数
    onRefresh(ListSelectData);
  };

  const onClickDetail = () => {
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
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        params: data,
      })
          .then(response => {
            setDetailData(response.data);
          });
    }
  }

  const onClickOk= () => {
    console.log(detailData)
    if (ListUpdateData) {
      let data: any = {}
      ListUpdateData.params.forEach(item => {
        data[item.name] = detailData[item.name]
      })
      axios({
        method: ListUpdateData.method,
        url: dataPath + ListUpdateData.url,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        data: data,
      })
          .then(response => {
            setOpen(false)
            handleButtonClick()
          });
    }
  }

  const showModal = () => {
    onClickDetail()
    console.log(detailData)
    setOpen(true);
  }


  return (
      <>
        <Button type="primary" onClick={showModal}>
          编辑
        </Button>
        <Modal
            title="保存数据"
            open={open}
            cancelText={"取消"}
            onOk={() => {
              onClickOk()
            }}
            onCancel={() => {setOpen(false)}}
            destroyOnClose={true}
            okText= "保存"
        >
          <Form>
            {ListUpdateData && ListUpdateData.params.map((item) => {
              return (
                  <Col key={item.name}>
                    <Form.Item required={item.required} name={item.name} label={item.displayName} rules={[{ pattern: new RegExp(item.regex), message: item.tips }]}>
                      <Input placeholder={item.placeholder} required={item.required} value={detailData[item.name]} onChange={ (e) =>{
                        const updatedData = { ...detailData, [item.name]: e.target.value };
                        setDetailData(updatedData);
                      }}/>
                    </Form.Item>
                  </Col>
              );
            })}
          </Form>
        </Modal>
      </>
  );
};

export default ContentUpdateModal;