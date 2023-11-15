import React, {useState} from 'react';
import './gstyle.css'

export default function Search(){

  const [selectedImage, setSelectedImage] = useState(null);
  var isChecked = "color";
  const [selectedFileName, setSelectedFileName] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setSelectedFileName(file.name);
    }
    console
  };

  const handleUploadClick = () => {
    // Logika untuk mengunggah gambar ke server dapat ditambahkan di sini
    // Misalnya, menggunakan FormData dan mengirimkan permintaan HTTP.
    // Tambahkan logika pengunggahan sesuai kebutuhan proyek Anda.
    console.log('Upload clicked');
  };

  const handleRemoveClick = () => {
    setSelectedImage(null);
    setSelectedFileName(null);
  };

  const handleCheckboxChange = (e) => {
    console.log("Before: ",isChecked)
    if (isChecked === "color"){
      isChecked = "texture"
    } else {
      isChecked = "color" 
    }
    console.log("After: ",isChecked)
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
              onChange={handleImageChange}
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
            <label htmlFor="search" className='btn search'>
              Search
            </label>
              <button id= "search" onClick={handleUploadClick} style={{display: 'none'}}></button>
          </div>
        </div>
      </div>
    </div>
  );
}

