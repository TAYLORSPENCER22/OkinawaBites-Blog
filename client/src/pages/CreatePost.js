import { useState } from "react";
import { Navigate } from "react-router-dom";
import 'react-quill-new/dist/quill.snow.css';
import Editor from "../Editor";
import ImageDropzone from "../ImageDropzone";
import LocationPicker from "../LocationPicker";


export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] =useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [location, setLocation] = useState('');
    const [redirect, setRedirect] = useState(false);
    async function createNewPost(ev) {
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);
        data.set('location', location);
        ev.preventDefault();
       const response = await fetch('http://localhost:4000/post', {
           method: 'POST',
           body: data,
           credentials: 'include',
      });
      if (response.ok) {
        setRedirect(true);
      }
    }

    if(redirect) {
        return <Navigate to ={'/'} />
    }
    return (
        <form className="quillFormat" onSubmit={createNewPost}>
            <h1 className="quillNewPostHeader">New Post</h1>
            <input type="title"
                placeholder={'Title'}
                value={title}
                onChange ={ev => setTitle(ev.target.value)}/>
            <input type="summary"
                placeholder={'Description'}
                value={summary}
                onChange={ev => setSummary(ev.target.value)} />
            <ImageDropzone onFilesSelected={setFiles} />
            <LocationPicker value={location} onChange={setLocation} />
            <Editor value={content} onChange={setContent} />

            <button className="createPostButton">Create Post</button>
        </form>
    );
}