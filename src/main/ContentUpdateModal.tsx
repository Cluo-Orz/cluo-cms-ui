import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal} from 'antd';
import {DynamicApi} from "./DynamicContent";
import { DeleteTwoTone}  from "@ant-design/icons";
import axios from "axios";
import DynamicFormItem from "./DynamicFormItem";



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
            'X-Client-Cms': 'true'
          },
          params: data,
        });
        console.log("response.data ",response.data)
        setDetailData(response.data);
      } catch (error) {
        // 处理请求错误
      }
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
          'X-Client-Cms': 'true'
        },
        data: data,
      })
          .then(response => {
            setOpen(false)
            handleButtonClick()
          });
    }
  }

  const showModal = async () => {
    await onClickDetail()
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
                    <DynamicFormItem globalDataUrl={dataPath} itemConfig={item} data={detailData[item.name]} modified={true } onChange={ (e:any) =>{
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

export default ContentUpdateModal;