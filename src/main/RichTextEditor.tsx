import React, { useState, useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import ReactQuill, {Range, UnprivilegedEditor} from "react-quill";
import {Sources} from "quill";

interface RichTextEditorProps {
    data: string;
    onChange: Function;
    isEdit: boolean;
}
const RichTextEditor: React.FC<RichTextEditorProps> = ({ data, onChange, isEdit }) => {
    const [content, setContent] = useState(data?data.replaceAll("<br>", "<br><br>"):"");

    const handleContentChange = (value: string, delta: any, source: Sources, editor: UnprivilegedEditor) => {
        if(isEdit && value) {
            let v = value;
            console.log("handleContentChange ", v, " ", v.search("\n"));
            setContent(v);
        }
    };
    const handleEditorBlur = () => {
        console.log(content); // Print the data when the editor loses focus
        let v = content;

        v = v.replaceAll("<p><br></p>", "<br>")
        v = v.replaceAll("</p><p>", "<br>")
        let e = {
            target: {
                value: v
            }
        }
        onChange(e);
    };
    return (
        <div>
            <ReactQuill value={content} onChange={handleContentChange}  onBlur={handleEditorBlur} modules={{
                toolbar: {
                    container: [
                        // [{ 'header': 1 }, { 'header': 2 }], // 标题 —— 独立平铺
                        // [{header: [1, 2, 3, 4, 5, 6, false]}], // 标题 —— 下拉选择
                        [{size: ["small", false, "large", "huge"]}], // 字体大小
                        [{list: "ordered"}, {list: "bullet"}], // 有序、无序列表
                        ["blockquote", "code-block"], // 引用  代码块
                        // 链接按钮需选中文字后点击
                        // ["link", "image", "video"], // 链接、图片、视频
                        [{align: []}], // 对齐方式// text direction
                        [{indent: "-1"}, {indent: "+1"}], // 缩进
                        ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
                        [{color: []}, {background: []}], // 字体颜色、字体背景颜色
                        [{'script': 'sub'}, {'script': 'super'}],      // 下标/上标
                        [{'font': []}],//字体
                        ["clean"], // 清除文本格式
                    ]
                }
            }}/>
        </div>
    );
};

export default RichTextEditor;
