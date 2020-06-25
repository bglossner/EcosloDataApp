
import React from "react";
import "../styles/home.css";
import "../styles/index.css";
import {Row, Col, Container} from "react-bootstrap"; 
import styled, { css } from 'styled-components'

const Button = styled.button`
background: transparent;
font-size: 1em;
width: 148.8px;
border-radius: 3px;
border: 2px solid #dd9933;
color: #dd9933;
margin: 1em 1em;
padding: 1em 1em;
${props => props.primary  && css`
background: #dd9933;
color: white;
`}
`;

class Home extends React.Component {
    render() {
        return (
            <div>
                <div id="home-page" className="page">
                
                    <div style={{height: "20%"}} />
                    <div className="centered">
                        <img style={{transform: "scale(1.3)", margin: "2% 0"}} src={require("../images/ECOSLO_logo.png")} alt="Eco SLO" />
                    </div>
                    <div className="center-strip">
                        <span className="upper">Cleanup Database</span>
                    </div>
                    <div style={{margin: "140px"}}>
                        <Container>
                            <Row>
                                <Col>
                                    <Button as="a" href="/add" primary>ADD EVENT</Button>
                                </Col>
                                <Col>
                                    <Button as="a" href="/view" primary>VIEW DATA</Button>
                                </Col>
                                <Col>
                                    <Button as="a" href="/update" primary>UPDATE EVENT</Button>
                                </Col>
                                <Col>
                                    <Button as="a" href="/alter" primary>ALTER TABLE</Button>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    {/* <div style={{height: "25%"}} />
                    <div className="home-buttons">
                        <a href="/add" className="home-button upper">Add</a>
                        <a href="/update" className="home-button upper">Update</a>
                        <a href="/view" className="home-button upper">View</a>
                    </div> */}
                </div>
            </div>
        );
    }
}

export default Home;