import React, { useCallback, useState } from 'react';
import Swal from 'sweetalert';

const ScrapeImage = () => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffTime, setDiffTime] = useState(false);
  const [secondTime, setSecondTime] = useState(0);

  const handleUrlChange = (event) => {
      setUrlInput(event.target.value);
    };


  const onChangeUrl = async () => {
      if (!urlInput) {
      console.error('URL is required.');
      return;
      }
  
      setDiffTime(false);
      const startTime = performance.now();
  
      setLoading(true);
  
      try {
      const response = await fetch(`http://localhost:8080/scrape/${urlInput}`, {
          method: 'GET',
      });
  
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log(responseData);
      Swal('Image scraping successful');
      } catch (error) {
      console.error('Error scraping URL', error);
      alert(error.message || 'Error scraping URL');
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
        <div className='url-input'>
          <input
            type='text'
            placeholder='Enter URL'
            value={urlInput}
            onChange={handleUrlChange}
            disabled={loading}
          />
        </div>
        <div className='label-upload'>
          <button className='butn dataset-upload' onClick={onChangeUrl} disabled={loading}>
            Upload
          </button>
        </div>
        {loading && (
          <div className='loading-style'>
            <div className='box-input loading'>
              <p id='loading-disable'>Loading</p>
            </div>
            <div className='typing-animation'>
              <div className='dot dot1'></div>
              <div className='dot dot2'></div>
              <div className='dot dot3'></div>
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

export default ScrapeImage;
