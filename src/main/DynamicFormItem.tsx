import React, { useState } from 'react';
import {Button, Col, Form, Input, Modal, Table} from 'antd';
import {DynamicApi} from "./DynamicContent";
import axios from "axios";
import { DeleteTwoTone,DeleteFilled}  from "@ant-design/icons";
import DynamicFormTableItem from "./DynamicFormTableItem";



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
    rowCount: number
}
interface DynamicFormItemProps {
    itemConfig: DynamicFormItemConfig
    data: any
    modified: boolean
    onChange: Function
}



const DynamicFormItem: React.FC<DynamicFormItemProps> = ({itemConfig, data, modified, onChange}) => {

    const [tableData, setTableData] = useState(data? data : (itemConfig.defaultValue?JSON.parse(itemConfig.defaultValue):[]));

    const findItem = () =>{
        if(itemConfig.type === 'Button'){
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