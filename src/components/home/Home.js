import React from "react";
import './home.css'
import {Link} from 'react-router-dom'
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
`;

const HowToUse = styled.div`
  margin-top: 20px;
`;

export default function Home(){
    return (
        <Container>
            <Title>Image Search App</Title>
            <Title>by SABUN BOLONG</Title>
            <HowToUse>
                <h2>How to Use:</h2>
                <ol>
                <li>Upload a dataset using the "Upload Data Set" button.</li>
                <li>Insert an image to search in the dataset.</li>
                <li>Click the "Search" button and wait for the process to finish.</li>
                <li>The similar image from the dataset will be displayed.</li>
                </ol>
            </HowToUse>
            <Link id="try-it" className="link-home" to={"/search"}>Try It Right Now</Link>
        </Container>
    );
}
