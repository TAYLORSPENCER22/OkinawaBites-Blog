import ReactQuill from "react-quill-new";

export default function Editor({value, onChange}) {

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote',],
        ['link', 'image',],
      
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['clean']                                         // remove formatting button
      ];

      const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 
        'list','indent',
        'link', 'image',  'color', 'background', 'font', 'align', 'size',
      ];

      
    return (
     <ReactQuill 
        value={value}
        onChange={onChange}
        modules={{ toolbar: toolbarOptions}}
        formats = {formats} 
        />
    );
}