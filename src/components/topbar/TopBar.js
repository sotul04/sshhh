import React from "react";
import './topstyle.css'
import {Link} from 'react-router-dom'


export default function TopBar(){
    return(
        <div className="top-main">
            <div>
                <Link className="link-text">
                    <h2>SABUN BOLONG</h2>
                </Link>
            </div>
            <div className="box-link">
                <div className="link">
                    <Link className="link-text" to={"/"}>Home</Link>
                </div>
                <div className="link">
                    <Link className="link-text" to={"/about"}>About</Link>
                </div>
            </div>
        </div>
    )
}
