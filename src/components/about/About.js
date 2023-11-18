import React from 'react';
import "./about.css";

function DisplayBio({ Data }) {
    return (
        <div className='about-photo'>
            <img src={Data.path} alt="Profile"/>
            <h4>{Data.name}</h4>
            <h5>{Data.nim}</h5>
            <a href={Data.linkto} target="_blank" rel="noopener noreferrer">More</a>
        </div>
    )
}

export default function About() {
    const Kiel = { path: "Kiel_0.png", name: "Ignatius Jhon Hezkiel Chan",nim:"13522029", linkto: "https://github.com/chankiel" };
    const Suthasoma = { path: "Suta_0.png", name: "Suthasoma Mahardhika Munthe", nim: "13522098",linkto: "https://github.com/sotul04" };
    const Scifo = { path: "Scifo_0.png", name: "Marvin Scifo Y. Hutahaean", nim:"13522110",linkto: "https://github.com/scifo04" };

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
