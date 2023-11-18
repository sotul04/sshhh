// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import UploadImage from './components/UploadImage';
// import FileUploadForm from './components/ZippingFolder';
import Search from './components/search/GridType';
import TopBar from './components/topbar/TopBar';
import "./index.css"
import FileUploadForm from './components/zipping/ZippingFolder';
import BottomBar from './components/bottombar/Bottombar';
import Home from './components/home/Home';
import About from './components/about/About';


function SearchPage() {
  return (
    <div>
      <TopBar />
      <br/>
      <br/>
      <Search />
      <FileUploadForm />
      <BottomBar/>
    </div>
  )
}

function HomePage() {
  return (
    <div>
      <TopBar/>
      <br></br>
      <Home/>
      <BottomBar />
    </div>
  );
}

function AboutPage(){
  return (
    <div>
      <TopBar/>
      <br/>
      <About/>
      <BottomBar/>
    </div>
  )
}


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage/>}/>
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Router>
  );
}


export default App;
