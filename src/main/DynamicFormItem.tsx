import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal, Table, Upload, UploadFile} from 'antd';
import {DynamicApi} from "./DynamicContent";
import axios from "axios";
import {DeleteTwoTone, DeleteFilled, UploadOutlined} from "@ant-design/icons";
import DynamicFormTableItem from "./DynamicFormTableItem";
import {configData} from "../ConfigContext";



interface DynamicFormItemConfig {
    dataUrl: string,
    placeholder: string,
    displayName: string,
    name: string,
    type: string,
    required: boolean,
    regex: string,
    defaultValue: string,
    tips: string,
    fileCount: number,
    fileSuffix: string
}
interface DynamicFormItemProps {
    itemConfig: DynamicFormItemConfig
    data: any
    modified: boolean
    onChange: Function
    globalDataUrl: string
}
const DynamicFormItem: React.FC<DynamicFormItemProps> = ({itemConfig, data, modified, onChange, globalDataUrl}) => {

    const [tableData, setTableData] = useState(data? data : (itemConfig.defaultValue?JSON.parse(itemConfig.defaultValue):[]));
    const [fileList, setFileList] = useState(
        data
            ? typeof data === 'string'
                ? [
                    {
                        uid: '1',
                        name: '文件1',
                        status: 'done',
                        url: data,
                    }
                ]
                // @ts-ignore
                : data.map((it, index) => {
                    return {
                        uid: index,
                        name: '文件' + index,
                        status: 'done',
                        url: it
                    };
                })
            : []
    );

    const findItem = () =>{
        if(itemConfig.type === 'File'){
            console.log("file ", tableData[itemConfig.name])
            return (
                <>
                    <Upload
                        fileList={fileList}
                        name={itemConfig.name}
                        action={globalDataUrl+itemConfig.dataUrl}
                        listType={(
                            itemConfig.fileSuffix  && (itemConfig.fileSuffix.includes("png") || itemConfig.fileSuffix.includes("jpg") || itemConfig.fileSuffix.includes("jpeg"))
                        )?"picture":"text"}
                        maxCount={itemConfig.fileCount}
                        showUploadList={{
                            showRemoveIcon: modified
                        }}
                        onChange={(info) =>{
                            if(info && info.fileList){
                                let tempFileList : UploadFile[] = []
                                let filePathList : string[] = []
                                info.fileList.map((file, index) => {
                                    tempFileList[index] = file
                                    if(file.response) {
                                        file.response.forEach((it:any) => filePathList.push(it))

                                    }
                                })
                                setFileList(tempFileList)
                                console.log("fileList", tempFileList)
                                console.log("itemConfig.fileCount===1 ", itemConfig.fileCount===1)
                                console.log("upload ", itemConfig.fileCount===1?filePathList[0]:filePathList)
                                let e = {
                                    target: {
                                        value :itemConfig.fileCount===1?filePathList[0]:filePathList
                                    }
                                }
                                onChange(e); // Call the onChange function to update the state array
                            }
                        }}
                    >
                        {
                            modified?(<Button icon={<UploadOutlined/>}>{itemConfig.displayName}上传
                                (最多: {itemConfig.fileCount}个)</Button>):(<div/>)
                        }
                    </Upload>
                </>
            )
        }else if(itemConfig.type === 'Button'){
            return (
                <>

                </>
            )
        } else if(itemConfig.type === 'Table'){
            console.log("findItem")
            console.log(data)
            const handleTableChange = (newData:any[]) => {
                newData = newData.map(({dataIndex, ...rest}) => rest);
                setTableData(newData);
                let e = {
                    target: {
                        value :newData
                    }
                }
                onChange(e); // Call the onChange function to update the state array
            };

            let columns:any = [];
            if (tableData.length > 0) {
                // Get the keys from the first data item to determine the columns
                const keys = Object.keys(tableData[0]);
                columns = keys.map((key) => ({
                    title: key,
                    dataIndex: key
                }));
            }

            return (
                <DynamicFormTableItem data={tableData} onChange={handleTableChange} dataColumns={columns} modified={modified}/>
            );
        }else {
            console.log("itemConfig ",itemConfig)
            console.log(data)
           return (
               <>
                   <Form.Item required={itemConfig.required} name={itemConfig.name} label={itemConfig.displayName} rules={[{ pattern: new RegExp(itemConfig.regex), message: itemConfig.tips }]}>
                       <Input placeholder={itemConfig.placeholder} disabled={!modified} required={itemConfig.required} value={data} defaultValue={data} onChange={ (e)=>onChange(e)}/>
                   </Form.Item>
               </>
            )
        }
    }

    return findItem()
};

export default DynamicFormItem;