import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const CameraApp = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      capture();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const uploadImage = async () => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', dataURItoBlob(imageSrc), 'captured_image.png');

      // Send POST request with FormData
      const response = await fetch('http://your-gin-backend/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
      } else {
        console.error('Failed to upload image. Server returned:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Helper function to convert data URI to Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  };

  return (
    <div>
      <Webcam audio={false} ref={webcamRef} />
      {image && <img src={image} alt="Captured" />}
      <button onClick={uploadImage}>Upload Image</button>
    </div>
  );
};

export default CameraApp;
