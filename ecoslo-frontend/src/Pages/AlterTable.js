import React from "react"; 
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Row, Col, Modal, Card } from "react-bootstrap"; 
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import "../styles/page.css";
import ReactTooltip from "react-tooltip";
import { FaQuestionCircle } from "react-icons/fa";

class AlterTable extends React.Component {
    constructor(props) {
        super(props); 
        this.state = {
            formData : {
                action: "add",
                name: null, 
                dataType: "Numeric", 
            },
            help: false
        };
    }

    marginstyle={
        marginTop: '1.2em',
        marginBottom: '2em'
    }

    async componentDidMount(){
        let res = await this.props.apiWrapper.getColumns();
        let options = res.r.fields.map((content, index) =>{
          return <option>{content.name}</option>
        })
        this.setState({colNames: options})
    }

    validateEntry(formEntry) {
        if (formEntry.length === 0) {
            return true;
        }
      
        let regex = /^[a-zA-Z][a-zA-Z\s]*$/;
      
        return regex.test(formEntry);
    }

    handleTextboxChange(event) {
        console.log(event); 
        let old = this.state.formData;
        const value = event.target.value; 
        if (!this.validateEntry(value)) {
            alert("Column name includes invalid character: " + value); 
            return false; 
        }
        old["name"] = value; 
        this.setState({formData: old});
        console.log(this.state.formData);
    }

    handleSelectChangeAdd(event) {
        console.log(event);
        let old = this.state.formData;
        old["action"] = "add"; 
        old["dataType"] = event.target.value; 
        this.setState({formData: old});
        console.log(this.state.formData);
    }

    handleSelectChangeDelete(event) {
        console.log(event);
        let old = this.state.formData;
        old["action"] = "delete";
        old["name"] = event.target.value; 
        old["dataType"] = null; 
        this.setState({formData: old});
        console.log(this.state.formData);
    }

    async handleSubmitAdd() {
        let colName = this.state.formData["name"].replace(/ /g,"_"); 
        let value = this.state.formData["dataType"]; 
        let dType; 
        if (value === "Numeric") {
            dType = "DECIMAL"; 
        }
        else if (value === "Text") {
            dType = "STRING";  
        }
        else {
            dType = "BOOLEAN"; 
        }

        let data = {
            action: this.state.formData["action"],
            name: colName, 
            dataType: dType
        }
        
        console.log(data); 

        try {
            const res = await this.props.apiWrapper.alterTable(data);
            console.log(res);
            alert("Column successfully added to database.");
          }
        catch (error) {
            alert(error);
        }
    }

    async handleSubmitDelete() {
        let data = {
            action: this.state.formData["action"],
            name: this.state.formData["name"]
        }
        if(data.name === 'date' || data.name === 'location' || data.name === 'event name' || data.name == 'public'){
            alert('Cannot delete date, location, event name, or public.')
        }
        else{

            try {
                const res = await this.props.apiWrapper.alterTable(data);
                alert("Column successfully deleted from database.");
            }
            catch (error) {
                alert(error);
            }
        }
    }

    handleConfirmAdd(event) {
        event.preventDefault(); 
        confirmAlert({
            title: "Confirm to add column",
            message: "Are you sure you want to add a column named '" + this.state.formData['name'] + "' that stores '" + this.state.formData['dataType'] + "'?",
            buttons: [
              {
                label: 'Yes',
                onClick: () => {
                    this.handleSubmitAdd(); 
                }    
              },
              {
                label: 'No'
              }
            ]
        });
    }

    handleConfirmDelete(event) {
        event.preventDefault(); 
        confirmAlert({
            title: "Confirm to delete column",
            message: "Are you sure you want to delete the column named '" + this.state.formData['name'] + "'?",
            buttons: [
              {
                label: 'Yes',
                onClick: () => {
                    this.handleSubmitDelete(); 
                }    
              },
              {
                label: 'No'
              }
            ]
        });
    }


  displayHelpModal(){
    this.setState({help: true})
  }

  hideHelpModal(){
    this.setState({help: false})
  }


    render() {
        return (
            <div style={this.marginstyle}>
            <Modal centered show={this.state.help} onHide={() => this.hideHelpModal()}>
              <Modal.Header closeButton>
                <Modal.Title>Alter Table Page Help</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <b>Purpose and Use</b>
                <br />
                The Alter Table page allows you to change which items are being stored in the database. When you add or delete a column on this page, the change will be reflected in all other pages.
                <br /><br />
                <b>Adding a Column</b>
                <br />
                A column should be added only when it is no longer sufficient to add the item to the unusual items column. To add a column, you must use a name with no special characters or numbers,
                 and indicate a type for the data being stored. The type cannot be changed after the column has been created. If you choose the text option, the character limit is 1000. The default value for numeric columns is 
                 -1, the default value for True/False is simply nothing, or null, and the default value for text is empty. If you 
                see one of these values in the table, that most likely means the column was added after the cleanup was added to the database, or the data was not tracked during that cleanup.
                <br /><br />
                <b>Deleting a Column</b>
                <br />
                If a column is deleted, there is no way to get any of the data back. If you do want to delete the column, consider exporting the data that exists for that column before deleting it using the View page.
                <br />
              </Modal.Body>
            </Modal>

            <Container>
            <Row>
            <Col style={{ alignContent: 'right'}}>
              <FaQuestionCircle className="float-right" onClick={(e) => this.displayHelpModal()}/>
            </Col>
          </Row>
            <Form>
            <h2>
              Alter the Table Columns
            </h2>
                <div>
                <Card>
                    <Card.Body>
                        <Card.Title>Add a Column</Card.Title>
                        <Card.Text>
                        <div><strong>Note:</strong> Only add a column if it is absolutely necessary. The name of the new column must only include letters and spaces, no numbers or special characters are allowed.</div>

                        </Card.Text>
                        <Form.Group controlId="formBasicEmail">
                            <Row></Row>
                            <Row>
                                <Col>
                                <Form.Label>Name</Form.Label>
                                <Form.Control placeholder="Enter Column Name" onChange={(e) => this.handleTextboxChange(e)} />
                                </Col>
                                <Col>
                                <Form.Label>Type of Data</Form.Label>
                                <Form.Control as="select" onChange={(e) => this.handleSelectChangeAdd(e)} >
                                    <option>Numeric</option>
                                    <option>Text</option>
                                    <option>True/False</option>
                                </Form.Control>
                                </Col>
                            </Row>
                            <Button variant="solid" onClick={(e) => this.handleConfirmAdd(e)}>SUBMIT</Button>
                        </Form.Group>
                    </Card.Body>
                </Card>
                {/* <div><h4>Delete a Column</h4></div> */}
                {/* <div><strong>Note:</strong> Only delete a column if you are certain it is no longer needed. This action cannot be undone.</div> */}
                <div style={{margin: '20px'}}/>
                <Card>
                    <Card.Body>
                        <Card.Title>Delete a Column</Card.Title>
                        <Card.Text>
                            <strong>Note:</strong> Only delete a column if you are certain it is no longer needed. This action cannot be undone.
                        </Card.Text>
                <Form.Group controlId="formBasicEmail">
                    <Row>
                        <Col>
                        <Form.Label>Name</Form.Label>
                        <Form.Control as="select" onChange= {(e) => this.handleSelectChangeDelete(e)} >
                        <option>Choose...</option>
                        {this.state.colNames}
                        </Form.Control>
                        </Col>
                    </Row>
                    <Button variant="solid" onClick={(e) => this.handleConfirmDelete(e)}>SUBMIT</Button>
                </Form.Group>
                </Card.Body>
                </Card>
          </div>
        </Form>
        </Container>
      </div>
    );
    }
}

export default AlterTable; 