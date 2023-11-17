import React, { useCallback, useState } from 'react';
import JSZip from 'jszip';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import "./dataset.css"
import Swal from 'sweetalert';

const FileUploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diffTime, setDiffTime] = useState(false);
  const [secondTime, setSecondTime] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
    setDiffTime(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: loading });

  const onChangeFile = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.error('No files selected.');
      return;
    }
    setDiffTime(false);
    const startTime = performance.now();
  
    const zip = new JSZip();
    const files = selectedFiles;
  
    for (let file of files) {
      zip.file(file.name, file);
    }
  
    setLoading(true);
    setSelectedFiles([]);
  
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const formData = new FormData();
      formData.append('zipFile', content);
  
      const response = await axios.post('http://localhost:8080/upload-zip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 40000,
      });
  
      console.log(response.data);
      Swal("Upload Data Set berhasil."); // Handle the response accordingly
    } catch (error) {
      console.error('Error uploading and zipping files', error);
      alert(error.message || 'Error uploading and zipping files');
    } finally {
      setLoading(false);
      const endTime = performance.now();
      setDiffTime(true);
      var temp = endTime - startTime;
      var temp2 = temp / 1000;
      if (temp2 < 0) {
        temp2 = 0;
      }
      setSecondTime(temp2);
    }
  };
  
  return (
    <div className='main-dataset'>
      <div className='box-dataset'>
        {!loading && (
          <div {...getRootProps()} className='box-input' disabled={loading}>
            <input {...getInputProps()} className='input-dataset' disabled={loading}/>
            <div>
              {
                selectedFiles.length !== 0 ?
                  (<div className='file-exist'>
                    <div className='chosen-file'>
                      {selectedFiles.length === 1 ? 
                      (<p>
                        {selectedFiles.length} File Chosen
                      </p>) : (
                        <p>
                          {selectedFiles.length} Files Chosen
                        </p>
                      )}
                    </div>
                  </div>) :
                  <div className='no-file'>
                    <p>Upload Dataset Here</p>
                  </div>
              }
            </div>
          </div>
        )}
        {selectedFiles.length !== 0 && (
          <div className='label-upload'>
            <label htmlFor="upload-dataset" className='butn dataset-upload'>
              Upload
            </label>
            <button id="upload-dataset" type="button" onClick={onChangeFile} style={{display: 'none'}}>
            </button>
          </div>
        )}
        {loading && (
          <div className='loading-style'>
            <div className='box-input loading'>
              <p id="loading-disable">Loading</p>
            </div>
            <div className='typing-animation'>
              <div className="dot dot1"></div>
              <div className="dot dot2"></div>
              <div className="dot dot3"></div>
            </div>
          </div>
        )}
        {diffTime && (
          <div>
            <p>Berhasil diupload dalam waktu {secondTime.toFixed(2)}s.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadForm;
