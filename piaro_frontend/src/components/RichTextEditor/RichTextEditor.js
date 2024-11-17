import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

// Added value and onChange props
const RichTextEditor = ({ value, onChange }) => {
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false,
        }
    };

    return (
        <div className='text-editor'>
            <div className="flex justify-center items-center h-[10rem]">
                <h1 className="text-6xl font-extrabold">Quill.Js Text Editor</h1>
            </div>

            <ReactQuill
                theme='snow'
                formats={['header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link', 'image', 'video']}
                placeholder="Write something amazing..."
                modules={modules}
                onChange={onChange} // Modified to use onChange prop
                value={value} // Modified to use value prop
            />
        </div>
    );
};

export default RichTextEditor;
