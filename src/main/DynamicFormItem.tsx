import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal, Table, Upload, UploadFile} from 'antd';
import {DynamicApi} from "./DynamicContent";
import axios from "axios";
import {DeleteTwoTone, DeleteFilled, UploadOutlined} from "@ant-design/icons";
import DynamicFormTableItem from "./DynamicFormTableItem";
import {configData} from "../ConfigContext";
import type { RcFile, UploadProps } from 'antd/es/upload';



interface DynamicFormItemConfig {
    dataUrl: string,
    placeholder: string,
    displayName: string,
    name: string,
    fileName: string,
    type: string,
    required: boolean,
    regex: string,
    defaultValue: any,
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

    console.log("DynamicFormItem ", data)
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [tableData, setTableData] = useState(itemConfig.type === 'Table'? (data? (typeof data === 'string'?JSON.parse(data):data) : (itemConfig.defaultValue? (typeof itemConfig.defaultValue === 'string'?JSON.parse(itemConfig.defaultValue):itemConfig.defaultValue):[])) :[]);
    const [fileList, setFileList] = useState(data ? typeof data != 'object'
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
    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };


    const handleCancel = () => setPreviewOpen(false);

    const findItem = () =>{
        if(itemConfig.type === 'File'){
            return (
                <>
                    {itemConfig.displayName+"上传(最多上传:"+itemConfig.fileCount+"个):"}
                    <Upload
                        fileList={fileList}
                        name={itemConfig.fileName?itemConfig.fileName:itemConfig.name}
                        action={globalDataUrl+itemConfig.dataUrl}
                        listType={(
                            itemConfig.fileSuffix  && (itemConfig.fileSuffix.includes("png") || itemConfig.fileSuffix.includes("jpg") || itemConfig.fileSuffix.includes("jpeg"))
                        )?"picture-card":"text"}
                        maxCount={itemConfig.fileCount}
                        onPreview={handlePreview}
                        showUploadList={{
                            showRemoveIcon: modified
                        }}
                        onChange={(info) =>{
                            if(info && info.fileList){
                                let tempFileList : UploadFile[] = []
                                let filePathList: string[] = [];
                                console.log("fileData ", info);
                                tempFileList = info.fileList.map((file) => {
                                    if(file.url){
                                        filePathList.push(file.url)
                                    }else if (file.response) {
                                        filePathList = filePathList.concat(file.response);
                                    }
                                    return file;
                                });
                                setFileList(tempFileList)
                                console.log("filePathList", filePathList)
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
                            (modified && fileList.length < itemConfig.fileCount)?(<Button icon={<UploadOutlined/>}></Button>):(null)
                        }
                    </Upload>
                    <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            )
        }else if(itemConfig.type === 'Button'){
            return (
                <>

                </>
            )
        } else if(itemConfig.type === 'Table'){
            console.log("findItem ",data)
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
            console.log("itemConfig ",itemConfig, data)
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