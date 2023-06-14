import React, { useContext, useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';

const EditableContext = React.createContext<FormInstance<any> | null>(null);


interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: string;
    record: any;
    handleSave: (record:any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                       title,
                                                       editable,
                                                       children,
                                                       dataIndex,
                                                       record,
                                                       handleSave,
                                                       ...restProps
                                                   }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current!.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record?record[dataIndex]:"" });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            console.log("dataIndex ", dataIndex)
            console.log("values ", values)
            const tempData ={ ...record, ...values }
            console.log("tempData ",tempData)
            toggleEdit();
            handleSave(tempData);

        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{margin: 0}}
                name={dataIndex}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save}/>
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{paddingRight: 24}} onClick={toggleEdit}>
                {//@ts-ignore
                    children[1]?children:(<>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>)}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];


type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

interface DynamicFormTableItemProps {
    onChange: Function
    dataColumns: any[]
    data: any[]
    modified: boolean
}


const DynamicFormTableItem: React.FC<DynamicFormTableItemProps> = ({onChange, dataColumns, data,modified}) => {
    const [dataSource, setDataSource] = useState<any[]>((data?data:[]).map((it,idx)=>{
        return {
            ...it,
            dataIndex: idx
        }
    }));

    const [count, setCount] = useState(data?data.length:0);

    const handleDelete = (dataIndex: React.Key) => {
        const newData = dataSource.filter((item) => item.dataIndex !== dataIndex);
        setDataSource(newData);
        onChange(newData)
    };
    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: '编号',
            dataIndex: 'dataIndex',
            editable: false
        },
        ...dataColumns.map((item, index) => {
            return {
                ...item,
                editable: modified
            }
        }),
        // Conditionally include the operation column
        ...(modified
            ? [
                {
                    title: '操作',
                    dataIndex: 'operation',
                    editable: false,
                    // @ts-ignore
                    render: (_, record: { dataIndex: React.Key }) =>
                        dataSource.length >= 1 ? (
                            <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record.dataIndex)}>
                                <a>删除</a>
                            </Popconfirm>
                        ) : null
                }
            ]
            : [])
    ];

    const handleAdd = () => {
        const newData: any = [...dataSource, {
            dataIndex: count +1,
        }]
        setDataSource(newData);
        onChange(newData)
        setCount(count + 1);
    };

    const handleSave = (row: any) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.dataIndex === item.dataIndex);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
        onChange(newData)
        console.log(newData)
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: any) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    return (
        <div>
            {
                modified?(<Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                    添加
                </Button>):null
            }

            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                rowKey={'dataIndex'}
                columns={columns as ColumnTypes}
                pagination={false}
            />
        </div>
    );
};

export default DynamicFormTableItem;