import React from "react";
import { connect } from "react-redux";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdbreact';
import Alert from 'react-bootstrap/Alert';
import "../styles/index.css";
import "../styles/login.css";
import { userLoginInfo } from "../redux/actions/actions";
import { Redirect } from "react-router-dom";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
            error: null,
            loggedIn : false,
        }
    }

    updateUsername = (evt) => {
        this.setState({
            username: evt.target.value,
        });
    }

    updatePassword = (evt) => {
        this.setState({
            password: evt.target.value,
        });
    }

    async attemptSignIn() {
        try {
            let apiReturnValue = await this.props.apiWrapper.login(this.state.username, this.state.password);
            console.log(apiReturnValue);
            console.log("HJERE");
            this.props.loginStore({
                username: this.state.username,
                password: this.state.password
            });
            this.setState({ error : null, loggedIn : true });
        } catch (e) {
            if (e.message) {
                this.setState({ error : e.message });
            } else {
                alert("Error on server. Please contact web admins!");
            }
        }
    }

    render() {
        if (this.state.loggedIn) {
            return <Redirect to="/home" />
        }
        return (
            <React.Fragment>
                <div className="top-div-login" />
                <div className="center-component">
                    <MDBContainer>
                        <MDBRow>
                            <MDBCol md="6">
                                <form>
                                    <MDBCard>
                                        <MDBCardBody className="mx-4">
                                            <div className="text-center">
                                                <h3 className="dark-grey-text mb-5">
                                                    <strong>EcoSLO Database Sign In</strong>
                                                </h3>
                                            </div>
                                            <MDBInput
                                                label="Your username"
                                                group
                                                type="text"
                                                validate
                                                error="wrong"
                                                success="right"
                                                onChange={evt => this.updateUsername(evt)}
                                            />
                                            <MDBInput
                                                label="Your password"
                                                group
                                                type="password"
                                                validate
                                                containerClass="mb-0"
                                                onChange={evt => this.updatePassword(evt)}
                                            />
                                            {/* <p className="font-small blue-text d-flex justify-content-end pb-3">
                                                Forgot
                                                <a href="#!" className="blue-text ml-1">
                                                    Password?
                                                </a>
                                            </p> */}
                                            <div className="text-center mb-3">
                                                <MDBBtn
                                                    type="button"
                                                    gradient="blue"
                                                    rounded
                                                    className="btn-block z-depth-1a"
                                                    onClick={() => this.attemptSignIn()}
                                                >
                                                    Sign in
                                                </MDBBtn>
                                            </div>
                                            {this.state.error ? 
                                                <Alert
                                                    variant="danger"
                                                >
                                                    { this.state.error }
                                                </Alert> : null
                                            }
                                        </MDBCardBody>
                                    </MDBCard>
                                </form>
                            </MDBCol>
                        </MDBRow>
                    </MDBContainer>
                </div>
            </React.Fragment>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loginStore: apiResult => dispatch(userLoginInfo(apiResult)),
    };
};


export default connect(
    null,
    mapDispatchToProps,
)(Login);

