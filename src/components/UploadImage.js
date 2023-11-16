// src/components/UploadImage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);

    // Create a preview for the selected image
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadFile = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/search-color', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message) {
        alert('File uploaded successfully');
      } else {
        alert('Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        <p>Drag & drop an image here, or click to select one</p>
      </div>
      {file && (
        <div style={buttonStyle}>
          <p>Selected File: {file.name}</p>
          <div style={imgStyle}>
            {imagePreview && <img src={imagePreview} alt="Selected File Preview" />}
          </div>
          <br></br>
          <button onClick={uploadFile}>Upload</button>
        </div>
      )}
    </div>
  );
};

// Rest of the code remains the same


const dropzoneStyles = {
  border: '2px solid #ccc',
  borderRadius: '5px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  innerWidth: '50%',
  margin: '20px 40% 0px 20px'
};

const buttonStyle = {
  textAlign: 'left',
  margin: '0px 0px 0px 20px',
  padding: '0px 0px 10px 10px',
  innerWidth: '20px',
  outerWidth: '30px'
}

const imgStyle = {
  maxWidth: '100%',
  maxHeight: '50px',
  border: '2px solid #ccc',
  borderRadius: '5px',
  innerWidth: '50%',
  margin: '0px opx 20px 0px'
}

export default UploadImage;
