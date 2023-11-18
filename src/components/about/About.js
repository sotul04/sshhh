import React from 'react';
import "./about.css";

function DisplayBio({ Data }) {
    return (
        <div className='about-photo'>
            <img src={Data.path} alt="Profile"/>
            <p>{Data.name}</p>
            <a href={Data.linkto} target="_blank" rel="noopener noreferrer">Click me</a>
        </div>
    )
}

export default function About() {
    const Kiel = { path: "16.jpg", name: "Ignatius Jhon Hezkiel Chan", linkto: "https://youtube.com" };
    const Suthasoma = { path: "4.jpg", name: "Suthasoma Mahardhika Munthe", linkto: "https://youtube.com" };
    const Scifo = { path: "12.jpg", name: "Marvin Scifo Y. Hutahaean", linkto: "https://youtube.com" };

    return (
        <div className='about-box'>
            <h2>ABOUT US</h2>
            <div className='container-about'>
                <DisplayBio Data={Kiel}/>
                <DisplayBio Data={Suthasoma}/>
                <DisplayBio Data={Scifo}/>
            </div>
        </div>
    )
}
