import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { withRouter } from 'react-router-dom';
import "../styles/header.css";
import "../styles/index.css";

const linkToTextNotLoggedIn = {
  "/login" : "Login",
  "/home" : "Home",
  "/add" : "Add",
  "/view" : "View",
  "/update" : "Update", 
  "/alter" : "Alter Table"
};

const linkToTextLoggedIn = {
  "/logout" : "Logout",
  "/home" : "Home",
  "/add" : "Add",
  "/view" : "View",
  "/update" : "Update", 
  "/alter" : "Alter Table"
};

class Header extends React.Component {

  render() {
    var currLinkToText = {};
    if(this.props.loggedIn === true){
      currLinkToText = linkToTextLoggedIn;
    }
    else{
      currLinkToText = linkToTextNotLoggedIn;
    }
    return (
      <div >
        <Navbar className="header-strip" variant="dark">
          <img
            src={require("../images/circle-cropped-ecoslo.png")}
            width="40"
            height="40"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
          <Nav>
            { Object.keys(currLinkToText).map((linkName) => {
                const linkAt = this.props.location.pathname || "/home";
                if (linkAt === linkName) {
                  return (
                    <Navbar.Brand 
                      href={linkName}
                      key={linkName}
                      className="ml-3"
                    >
                      {currLinkToText[linkName]}
                    </Navbar.Brand>
                  );
                }
            
                return (
                  <Nav.Link
                    href={linkName}
                    key={linkName}
                  >
                    {currLinkToText[linkName]}
                  </Nav.Link>
                );
            
              }
            )
            }
          </Nav>
      </Navbar>
      <div></div>
      </div>
    );
  }
}
export default withRouter(Header);
