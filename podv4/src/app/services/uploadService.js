import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { storage } from '../../../firebase'; // Ensure this path is correct

class UploadFileService {
    constructor() {
        this.storage = storage;
        this.slicerApiUrl = 'https://www.slant3dapi.com/api/slicer';
        this.apiKey = 'YOUR_API_KEY';
    }

    async uploadFile(file, onProgress) {
        try {
            const storageRef = ref(this.storage, `files/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress(Math.round(progress));
                    },
                    (error) => reject(error),
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );
            });
        } catch (error) {
            console.error('Error uploading file to Firebase:', error);
            throw error;
        }
    }

    async processFile(file, onProgress) {
        try {
            const fileUrl = await this.uploadFile(file, onProgress);
            const response = await axios.post(this.slicerApiUrl, { fileURL: fileUrl }, {
                headers: { 'api-key': this.apiKey }
            });

            return { fileUrl, slicerApiResponse: response.data }; // Include the entire response
        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    }


}

export default UploadFileService;
