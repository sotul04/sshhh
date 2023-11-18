import React from "react";
import './topstyle.css'
import {Link} from 'react-router-dom'


export default function TopBar(){
    return(
        <div className="top-main">
            <div className="left-top">
                <Link className="link-text" to={"/"}>
                    <img src="sabunbolong.png" className="logo-pit"/>
                    {/* <h2>SABUN BOLONG</h2> */}
                </Link>
            </div>
            <div className="box-link">
                <div className="link">
                    <Link className="link-text" to={"/search"}>Search</Link>
                </div>
                <div className="link">
                    <Link className="link-text" to={"/about"}>About Us</Link>
                </div>
            </div>
        </div>
    )
}
