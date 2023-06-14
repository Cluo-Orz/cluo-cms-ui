import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal} from 'antd';
import {DynamicApi} from "./DynamicContent";
import { DeleteTwoTone}  from "@ant-design/icons";
import axios from "axios";
import DynamicFormItem from "./DynamicFormItem";



interface ContentInsertModalProps {
  ListInsertData: DynamicApi | undefined;
  ListSelectData: DynamicApi | undefined;
  dataPath: string;
  onRefresh: Function;

    style?: React.CSSProperties;
}



const ContentInsertModal: React.FC<ContentInsertModalProps> = ({ListInsertData, ListSelectData, dataPath, onRefresh}) => {
  const [open, setOpen] = useState(false);

  const [detailData ,setDetailData] = useState<any>({})

  const handleButtonClick = () => {
    console.log(ListSelectData)
    // 在需要刷新父组件的地方调用回调函数
    onRefresh(ListSelectData);
  };

  const onClickDetail = () => {
    if (ListInsertData) {
       let data:any = {}

      ListInsertData.params.forEach(item => {
        if(item.defaultValue) {
          data[item.name] = item.defaultValue
        }
      })
    }
  }

  const onClickOk= () => {
    console.log(detailData)
    if (ListInsertData) {
      let data: any = {}
      ListInsertData.params.forEach(item => {
          console.log(item.name)
        data[item.name] = detailData[item.name]
      })
      axios({
        method: ListInsertData.method,
        url: dataPath + ListInsertData.url,
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
          新增
        </Button>
        <Modal
            title="新建数据"
            open={open}
            cancelText={"取消"}
            onOk={() => {
              onClickOk()
            }}
            onCancel={() => {setOpen(false)}}
            destroyOnClose={true}
            okText= "新建"
        >
          <Form>
            {ListInsertData && ListInsertData.params && ListInsertData.params.map((item) => {
              return (
                  <Col key={item.name}>
                      <DynamicFormItem itemConfig={item} data={detailData[item.name]} modified={true} onChange={ (e:any) =>{
                          const updatedData = { ...detailData, [item.name]: e.target.value };
                          setDetailData(updatedData);
                      }}/>
                  </Col>
              );
            })}
          </Form>
        </Modal>
      </>
  );
};

export default ContentInsertModal;