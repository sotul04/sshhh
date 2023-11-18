import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert';
import { Pagination } from '@mui/material';
import './gstyle.css';

function Item({ fileComponent }) {
  const filePath = fileComponent.path;
  const percentage = fileComponent.percentage;
  const percent = percentage?.toFixed(2) + '%';
  console.log('Data:', filePath, 'Percent:', percent);
  return (
    <div className='item-page'>
      <div className='percent-info'>
        <p>{percent}</p>
      </div>
      <br />
      <img src={filePath} alt='Similar Image' className='item-image' />
    </div>
  );
}

export default function Search() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [typeSearch, setTypeSearch] = useState(false);
  const [image, setImage] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [listSimiliarImage, setListSimiliarImage] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [time,setTime] = useState(0);
  const imagesPerPage = 28; // 4 images in a row and 3 in a column

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setSelectedFileName(file.name);
      setImage(file);
    }
    console.log(image, ' has been loaded.');
  };

  const handleSearch = async () => {
    console.log('Search clicked');
    if (!image) {
      Swal('Tidak Ada Image yang Diinput.');
      return;
    }
    const starttime = performance.now();
    const formData = new FormData();
    formData.append('file', image);

    console.log(formData);
    var searchType = typeSearch
      ? 'http://localhost:8080/search-texture'
      : 'http://localhost:8080/search-color';

    setWaiting(true);

    try {
      const response = await fetch(searchType, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      const length = data.length;
      console.log('Panjang:', length);

      const endTime = performance.now();
      var temp = endTime - starttime;
      temp = temp / 1000;

      if (temp < 0) {
        temp = 0;
      }
      temp = temp.toFixed(2);
      setTime(temp);
      const lengthData = 'Menemukan ' + length + ' image.';
      Swal(lengthData);

      const responseData = data.data;
      console.log('Data:', responseData);

      // Directly set the state with the fetched data
      if (responseData != null){
        setListSimiliarImage(responseData.map((fileImg) => ({ ...fileImg, path: fileImg.path })));
      } else {
        setListSimiliarImage([]); 
      }
    } catch (error) { 
      console.error('Error uploading file', error);
      Swal(error.message || 'Error uploading file');
    } finally {
      console.log('Berhasil');
      setWaiting(false);
    }
  };

  const handleRemoveClick = () => {
    setSelectedImage(null);
    setSelectedFileName(null);
    setImage(null);
  };

  useEffect(() => {
    console.log('Selected Image:', selectedImage);
  }, [selectedImage]);

  const handleCheckboxChange = () => {
    console.log('Before: ', typeSearch);
    var temp = typeSearch;
    setTypeSearch(!temp);
    console.log('After: ', typeSearch);
  };

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = listSimiliarImage.slice(indexOfFirstImage, indexOfLastImage);

  const paginate = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className='all-container'>
      <div className='upload-box'>
        {/* Area untuk menampilkan atau memprediksi gambar yang akan diupload */}
        <div>
          <div className='upload-content'>
            {selectedImage ? (
              <div className='image-preview'>
                <img src={selectedImage} alt='Preview' className='img-preview' />
                <br />
                <label htmlFor='remove' className='btn remove'>
                  Remove
                </label>
                <button id='remove' onClick={handleRemoveClick} style={{ display: 'none' }}>
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <p>Preview Image</p>
              </div>
            )}
          </div>
        </div>

        {/* Tombol "Upload" */}
        <div className='input-box'>
          <div className='main-top'>
            <div className='top-input'>
              <p style={{ margin: '0px 0px 10px 3px' }}>Image Input</p>
              <label htmlFor='fileInput' className='btn upload'>
                Insert an Image
              </label>
              <input
                type='file'
                id='fileInput'
                accept='image/*'
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              {selectedFileName ? (
                <p style={{ margin: '10px 0px 10px 3px' }}>File name: {selectedFileName}</p>
                ) : (
                <p style={{ margin: '10px 0px 10px 3px' }}>No File Chosen</p>
              )}
            </div>
          </div>
          <div className='main-bottom'>
            <div className='bottom-search'>
              <div className='type-search'>
                <p>Color</p>
                <label className='switch'>
                  <input type='checkbox' value='1' onChange={handleCheckboxChange}></input>
                  <span className='slider'></span>
                </label>
                <p>Texture</p>
              </div>
              {waiting ? (
                <label className='btn search'>Search</label>
              ) : (
                <div className='temp-search'>
                  <label htmlFor='search' className='btn search'>
                    Search
                  </label>
                  <button id='search' onClick={handleSearch} style={{ display: 'none' }}></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {listSimiliarImage.length > 0 && (
        <div className='box-pagination'>
          <div className='header'>
            <p>{listSimiliarImage.length} gambar ditemukan dalam waktu {time}s</p>
          </div>
          <div className='parent-container'>
            <div className='grid-container'>
              {currentImages.map((fileImg, index) => (
                <Item key={index} fileComponent={fileImg} />
              ))}
            </div>
          </div>
          <div className='paginate-box'>
          <Pagination
            count={Math.ceil(listSimiliarImage.length / imagesPerPage)}
            page={currentPage}
            onChange={paginate}
            color='secondary'
            shape='rounded'
            showFirstButton
            showLastButton
          />
          </div>
        </div>
      )}
    </div>
  );
}
