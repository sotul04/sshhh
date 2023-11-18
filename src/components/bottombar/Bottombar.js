import React from "react";
import './bottom.css'
import {Link} from 'react-router-dom'


export default function BottomBar(){
    return(
        <div className="bottom-main">
            <div className="copyright">
                <p>Copyright &#169; 2023</p>
                <p>Sabun Bolong</p>
            </div>
            <div className="box-link">
                <div className="link">
                    <Link className="link-text" to={"/about"}>More About Us</Link>
                </div>
            </div>
        </div>
    )
}
