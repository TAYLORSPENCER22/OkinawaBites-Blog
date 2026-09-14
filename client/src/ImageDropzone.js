import { useRef, useState } from "react";

export default function ImageDropzone({ onFilesSelected, existingCover }) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const inputRef = useRef(null);

    function handleFiles(fileList) {
        if (fileList && fileList[0]) {
            onFilesSelected(fileList);
            setPreviewUrl(URL.createObjectURL(fileList[0]));
        }
    }

    function handleDrop(ev) {
        ev.preventDefault();
        setIsDragging(false);
        handleFiles(ev.dataTransfer.files);
    }

    function handleDragOver(ev) {
        ev.preventDefault();
        setIsDragging(true);
    }

    const displayImage = previewUrl || existingCover;

    return (
        <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={ev => handleFiles(ev.target.files)}
            />
            {displayImage ? (
                <img className="dropzone-preview" src={displayImage} alt="Cover preview" />
            ) : (
                <p className="dropzone-text">Drag & drop a cover image here, or click to browse</p>
            )}
        </div>
    );
}
