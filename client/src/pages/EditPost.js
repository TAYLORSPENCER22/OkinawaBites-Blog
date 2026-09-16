import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";
import DeletePage from "./DeletePage";
import ImageDropzone from "../ImageDropzone";
import LocationPicker from "../LocationPicker";

export default function EditPost() {

    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] =useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [cover, setCover] = useState('');
    const [location, setLocation] = useState('');
    const[redirectToPost, setRedirectToPost] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/post/'+id)
        .then(response => {
            response.json().then(postInfo => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
                setCover(postInfo.cover);
                setLocation(postInfo.location?._id || '');
            });
        });
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        data.set('location', location);
        if(files?.[0]) {
        data.set('file', files?.[0]);
        }
       const response = await fetch('http://localhost:4000/post', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });
        if(response.ok) {
             setRedirectToPost(true);
        }
    }

    if(redirectToPost) {
        return <Navigate to ={'/post/'+id} />
    }

    return (
        <div>
            <form className="quillFormat" onSubmit={updatePost}>
                <h1>Edit Post</h1>
                <input type="title"
                    placeholder={'Title'}
                    value={title}
                    onChange ={ev => setTitle(ev.target.value)}/>
                <input type="summary" 
                    placeholder={'Summary'}
                    value={summary}
                    onChange={ev => setSummary(ev.target.value)} />
                <ImageDropzone
                    onFilesSelected={setFiles}
                    existingCover={cover ? (cover.startsWith('http') ? cover : `http://localhost:4000/${cover}`) : null}
                />
                <LocationPicker value={location} onChange={setLocation} />
                <Editor onChange={setContent} value={content} />
                <button className="createPostButton">Update Post</button>
            <div>
                <DeletePage />
            </div>
            </form>
        </div>
    );
}