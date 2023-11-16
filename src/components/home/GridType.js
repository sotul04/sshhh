import React, {useState, useEffect} from 'react';
import Swal from "sweetalert";
import './gstyle.css'

export default function Search(){

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [typeSearch, setTypeSearch] = useState(false);
  const [image, setImage] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setSelectedFileName(file.name);
      setImage(file);
    }
    console.log(image, " has been loaded.");
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
    var searchType = typeSearch ? 'http://localhost:8080/search-texture' : 'http://localhost:8080/search-color';
    
    setWaiting(true);

    try {
      const response = await fetch(searchType, {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(data => {

        const length = data.length;
        console.log('Panjang:', length);
       // Swal("Berhasil mengupload file.Jumlah gambar ditemukan:",length);
        const endTime = performance.now();
        var temp = endTime-starttime;
        temp = temp/1000;
        if (temp < 0){
          temp = 0;
        }
        temp = temp.toFixed(2);
        const lengthData = "Menemukan "+length+" image dalam waktu "+temp+"s.";
        Swal(lengthData);
        const responseData = data.data;
        console.log('Data:', responseData);
      })
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
    console.log("Before: ",typeSearch)
    var temp = typeSearch;
    setTypeSearch(!temp);
    console.log("After: ", typeSearch);
    // Jika Anda ingin menyimpan nilai 0 atau 1 dalam variabel terpisah, Anda dapat menambahkan logika berikut:
    // const valueToSave = e.target.checked ? 1 : 0;
    // Simpan valueToSave sesuai kebutuhan Anda.
  };

  return (
    <div className="upload-box">
      {/* Area untuk menampilkan atau memprediksi gambar yang akan diupload */}
      <div>
        <div className='upload-content'>
          {selectedImage ? (
            <div className='image-preview'>
              <img src={selectedImage} alt="Preview" />
              <br/>
              <label htmlFor="remove" className='btn remove'>
                Remove
              </label>
              <button id="remove" onClick={handleRemoveClick} style={{display: 'none'}}>Remove</button>
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
            <p style={{margin: '0px 0px 10px 3px'}}>Image Input</p>
            <label htmlFor="fileInput" className='btn upload'>
              Insert an Image
            </label>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            {
              selectedFileName ? (<p style={{margin:'10px 0px 10px 3px'}}>File name: {selectedFileName}</p>) : (<p style={{margin: '10px 0px 10px 3px'}}>No File Chosen</p>)
            }
          </div>
        </div>
        <div className='main-bottom'>
          <div className='bottom-search'>
            <div className='type-search'>
              <p>Color</p>
              <label className="switch">
                <input type="checkbox" value="1" onChange={handleCheckboxChange}></input>
                <span className="slider"></span>
              </label>
              <p>Texture</p>
            </div>
            {
              waiting ? (
                  <label className='btn search'>
                    Search
                  </label>
              ) : (
                <div className='temp-search'>
                  <label htmlFor="search" className='btn search'>
                    Search
                  </label>
                    <button id= "search" onClick={handleSearch} style={{display: 'none'}}></button>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

