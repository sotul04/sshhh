// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import UploadImage from './components/UploadImage';
// import FileUploadForm from './components/ZippingFolder';
import Search from './components/home/GridType';
import TopBar from './components/topbar/TopBar';
import "./index.css"
import FileUploadForm from './components/zipping/ZippingFolder';


function Home() {
  return (
    <div>
      <TopBar />
      <br/>
      <br/>
      <Search />
      <FileUploadForm />
    </div>
  )
}

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Home />} />
        </Routes>
      </Router>
  );
}


export default App;
