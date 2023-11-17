import React, { useState } from 'react';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarImages, setSimilarImages] = useState([]);
  const [dataCount, setDataCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of items to display per page
  const pathPrev = "";

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setSimilarImages([]); // Reset the displayed images
  };

  const uploadImage = async () => {
    if (!image) {
      setError('No image selected');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch('http://localhost:8080/search/texture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data. HTTP status: ' + response.status);
      }

      const responseData = await response.json();

      if (!Array.isArray(responseData.array) || responseData.array.length === 0) {
        throw new Error('No similar images found in the response');
      }

      setSimilarImages(responseData.array);
      setDataCount(responseData.countData);
      setCurrentPage(1); // Reset to the first page after each upload
    } catch (error) {
      console.error('Error in try block:', error.message);
      setError('Failed to fetch similar images');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = similarImages.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={uploadImage}>Upload and Find Similar</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {currentItems.length > 0 && (
        <div>
          <p>Total Data Count: {dataCount}</p>
          {currentItems.map((similarImage, index) => (
            <div key={index}>
              <p>Similarity: {similarImage.similarity.toFixed(2)}%</p>
              <img src={`${pathPrev}/${similarImage.URL}`} alt={`Similar Image ${index + 1}`} />
            </div>
          ))}
          <div>
            {/* Pagination controls */}
            {Array.from({ length: Math.ceil(similarImages.length / itemsPerPage) }).map((_, index) => (
              <button key={index} onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
