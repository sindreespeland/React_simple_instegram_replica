import React, { useState } from "react";
import { BASE_URL } from "./App";
import { Button } from "@mui/material";

interface UploadImageProps {
    authToken: string | null
    authTokenType: string | null
    userId: string | null
}

const ImageUpload: React.FC<UploadImageProps> = ({ authToken, authTokenType, userId }) => {

    const [caption, setCaption] = useState<string>('');
    const [image, setImage] = useState<File | null>(null);

    const handleChange = (e: any) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0])
        }
    }

    const handleUpload = (e: any) => {
        e?.preventDefault();

        if (!image) {
            console.error("No image selected");
            return;
          }

        const formData = new FormData();
        formData.append('image', image)

        const requestOptions = {
            method: 'POST',
            headers: new Headers({
                'Authorization': authTokenType + ' ' + authToken
            }),
            body: formData
         }
        fetch(BASE_URL + 'post/image', requestOptions)
         .then(response => {
            console.log(response)
            if (response.ok) {
                return response.json()
            }

            throw response
         })
         .then(data => {
            createPost(data.filename)
         })
         .catch(error => {
            console.log(error)
         })
         .finally(() => {
            setCaption('');
            setImage(null);
            (document.getElementById('file-input') as HTMLInputElement).value = '';
        })
    }

    const createPost = (imageUrl: string) => {

        const json_string = JSON.stringify({
            'image_url': imageUrl,
            'image_url_type': 'relative',
            'caption': caption,
            'creator_id': userId
        })

        const requestOptions = {
            method: 'POST',
            headers: new Headers({
                'Authorization': authTokenType + ' ' + authToken,
                'Content-Type': 'application/json'
            }),
            body: json_string
        }

        fetch(BASE_URL + 'post', requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw response
            })
            .then(() => {
                window.location.reload()
                window.scrollTo(0, 0)
            })
            .catch(error => {
                console.log(error)
            })
    }


    return (
        <div className="image-upload">
            <input type="text" placeholder="Enter a caption" onChange={(event) => setCaption(event.target.value)} />
            <input type="file" id="file-input" onChange={handleChange} />
            <Button className="image-upload-button" onClick={handleUpload}>Upload</Button>
        </div>
    );
};

export default ImageUpload;
