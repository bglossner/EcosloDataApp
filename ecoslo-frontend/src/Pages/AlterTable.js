import React from "react"; 
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Row, Col } from "react-bootstrap"; 
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import "../styles/page.css";
import ReactTooltip from "react-tooltip";

class AlterTable extends React.Component {
    constructor(props) {
        super(props); 
        this.state = {
            formData : {
                action: "add",
                name: null, 
                dataType: "Numeric", 
            }
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
            dType = "INT"; 
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

    render() {
        return (
            <div style={this.marginstyle}>
            <Container>
            <Form>
                <Row>
                <a data-tip data-for='global'> ? </a>
                <ReactTooltip place="right" type="dark" effect="float" id='global' >
                <p>Use this page to add a column to store data collected on a new item.</p>
                <div>Make sure it is an item that has been encountered at </div>
                <div>multiple cleanups or that you expect to see more frequently, </div>
                <div>as opposed to an item that has only been encountered once </div>
                <div>on a cleanup, which would fall under the “unusual item” column.</div>
                <p></p>
                <div> You can also use this page to delete a column to remove data collected </div>
                <div>on a particular item across all cleanups, which you might do if you </div>
                <div>find that you no longer need data about an item or if it is an item </div>
                <div>that isn’t found frequently and would be better suited as an “unusual item.” </div>
                </ReactTooltip>
                </Row>
                <div>
                <div><h4>Add a Column</h4></div>
                <div><strong>Note:</strong> Only add a column if it is absolutely necessary. The name of the new column must only include letters and spaces, no numbers or special characters are allowed.</div>
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
                    <Button type="submit" onClick={(e) => this.handleConfirmAdd(e)}>Submit</Button>
                </Form.Group>
                <div><h4>Delete a Column</h4></div>
                <div><strong>Note:</strong> Only delete a column if you are certain it is no longer needed. This action cannot be undone.</div>
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
                    <Button type="submit" onClick={(e) => this.handleConfirmDelete(e)}>Submit</Button>
                </Form.Group>
          </div>
        </Form>
        </Container>
      </div>
    );
    }
}

export default AlterTable; 