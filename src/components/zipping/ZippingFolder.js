import React, { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { useDropzone } from 'react-dropzone';
import "./dataset.css"
import { useAsyncError } from 'react-router-dom';

const FileUploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diffTime, setDiffTime] = useState(false);
  const [secondTime, setSecondTime] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
    setDiffTime(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const formData = new FormData();
      formData.append('zipFile', content);

      axios.post('http://localhost:8080/upload-zip', formData)
        .then(response => {
          console.log(response.data); // Handle the response accordingly
        })
        .catch(error => {
          console.error('Error uploading and zipping files', error);
          alert(error);
        })
        .finally(() => {
          setLoading(false);
          setSelectedFiles([]);
          const endTime = performance.now();
          setDiffTime(true);
          var temp = endTime-startTime;
          var temp2 = temp/1000;
          if (temp2 < 0){
            temp2 = 0;
          }
          setSecondTime(temp2);
        });
      });
    setSelectedFiles([]);
  };

  return (
    <div className='main-dataset'>
      <div className='box-dataset'>
        <div div {...getRootProps()} className='box-input'>
          <input {...getInputProps()} className='input-dataset'/>
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
                  <p>Loading</p>
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
