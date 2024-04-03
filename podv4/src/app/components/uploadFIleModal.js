'use client'
import React, { useState, useEffect, useRef } from 'react';
import UploadFileService from '../services/uploadService';
import { useRouter } from 'next/navigation';
import { useFileUrl } from '../context/fileUrlContext';
import { PreviewService } from '../services/previewService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileUploadComponent = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const router = useRouter();
    const { setFileData } = useFileUrl();
    const previewService = new PreviewService();
    const fileInputRef = useRef(null);

    const checkFileDimensions = async (file) => {
        try {
            const geometry = await previewService.loadModel(URL.createObjectURL(file));
            const { length, width, height } = previewService.checkModelDimensions(geometry);

            if (length > 220 || width > 220 || height > 310) {
                toast.error("Too big, the part must fit in a 220 x 220 x 310 mm build volume.");
                setFile(null);
            } else {
                setFile(file);
            }
        } catch (error) {
            console.error('Error reading file dimensions:', error);
            toast.error('Error reading file dimensions. Please try again.');
            setFile(null);
        }
    };

    useEffect(() => {
        if (file) {
            uploadFile(file);
        }
    }, [file]);

    const uploadFile = async (file) => {
        setLoading(true);
        setUploadProgress(0);
        setUploadStatus(`Uploading: ${file.name}`);
        const uploadService = new UploadFileService();

        try {
            const updateProgress = (progress) => {
                setUploadProgress(progress);
                setUploadStatus(`Uploading: ${file.name} (${progress}%)`);
            };

            const response = await uploadService.processFile(file, updateProgress);
            setUploadStatus(`Upload successful: ${file.name}`);

            if (response && response.fileUrl) {
                const geometry = await previewService.loadModel(response.fileUrl);
                const { length, width, height } = previewService.checkModelDimensions(geometry);

                if (length > 220 || width > 220 || height > 310) {
                    toast.error("Too big, the part must fit in a 220 x 220 x 310 mm build volume.");
                    handleRemoveFile();
                } else {
                    setFileData({ fileUrl: response.fileUrl, slicerApiResponse: response.slicerApiResponse, filename: file.name });
                    router.push('/preview');
                }
            } else {
                console.error('No file URL available for preview');
            }
        } catch (error) {
            setUploadStatus(`Error during upload: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileInputChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile && (selectedFile.type === 'application/sla' || selectedFile.name.endsWith('.stl'))) {
            checkFileDimensions(selectedFile);
        } else {
            toast.error('Please select an STL file.');
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setLoading(false);
        setUploadProgress(0);
        setUploadStatus('');
    };

    const openFileInput = () => {
        fileInputRef.current.click();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile && (droppedFile.type === 'application/sla' || droppedFile.name.endsWith('.stl'))) {
            checkFileDimensions(droppedFile);
        } else {
            toast.error('I am sorry. We cannot accept that type of file yet. You must upload a .STL file');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
            className="max-w-md mx-10 my-10 p-6 border rounded-md shadow-lg bg-white transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <ToastContainer position={toast.POSITION.TOP_RIGHT} />
            <div
                className={`border-dashed border-2 border-gray-300 py-10 px-4 text-center cursor-pointer ${loading ? 'bg-gray-200' : 'bg-white'}`}
                onClick={openFileInput}
            >
                <input
                    type="file"
                    accept=".stl"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                />
                {file ? (
                    <p className="text-gray-700">{`Selected file: ${file.name}`}</p>
                ) : (
                    <p className="text-gray-700">{loading ? `Uploading: ${file && file.name}` : 'Drag \'n\' drop an STL file here, or click to select a file'}</p>
                )}
            </div>
            {file && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
                        &times;
                    </button>
                </div>
            )}
            {loading && (
                <div className="mt-4">
                    <progress className="w-full" value={uploadProgress} max="100"></progress>
                </div>
            )}
            {uploadStatus && <p className={`mt-4 ${loading ? 'text-blue-600' : 'text-green-600'}`}>{uploadStatus}</p>}
        </div>
    );
};

export default FileUploadComponent;
