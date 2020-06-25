import React from "react";
import "../styles/index.css";
import { ExportCSV } from '../Components/exportExcel.js'
import { Table, Container, Row, Col, Card } from "react-bootstrap";

class DataTable extends React.Component {

    marginstyle={
        marginTop: '1.5em',
        marginBottom: '1.2em'
    }
   

    formatColNames(colName) {
        let split = colName.split("_");
        let res = split.join(" ");
        return res
    }

    createTableHeader() {
        if(this.props.data !== undefined && this.props.data.rows !== undefined) {
            let res = Object.entries(this.props.data.rows[0]).map(([key, value]) => {
                return <th>{this.formatColNames(key)}</th>
            });
            return <tr>{res}</tr>;
        }
        else{
            return <div></div>
        }
    }

    formatDate(date) {
        return (date.substring(0, 10)).replace(/-/g,'/');;
    }

    createRow (index) {
        let res = Object.entries(index).map(([key, value]) => {
            if(key === 'date'){
                return <td>{this.formatDate(value)}</td>
            }
            if(value === false){
                return <td>{'false'}</td>
            }
            else if(value === true){
                return <td>{'true'}</td>
            }
            else{
                return <td>{value}</td>
            }
        });
        return res;
    }

    createTableBody() {
        let res = this.props.data.rows.map((index)=>{
            return (<tr>
                {this.createRow(index)}
            </tr>)
        });
        return res;
    }
      


    render() {
        if (this.props.data !== undefined && (this.props.data.rows !== undefined && this.props.data.rows !== [])){

        return (
            <div>
                <div>
                <ExportCSV csvData={this.props.data} fileName={"Cleanup Data"}></ExportCSV>
            </div>
            <div>
            
            <Container style={this.marginstyle}>
            <Card>
                <Row>
                    <Col xxs={2}></Col>
                    <Col md={{ span: 12}}>
            <Table striped bordered  hover size="sm" responsive>
                <thead>
                    {this.createTableHeader()}
                </thead>
                <tbody>
                    {this.createTableBody()}
                </tbody>
            </Table>
            </Col>
            <Col xxs={2}></Col>
            </Row>
            </Card>
            </Container>
            
            </div>



            </div>
            
        );
    }
    else if(this.props.showMessage){
        return <div className="big" style={{textAlign: 'center', margin: '20px'}}><b>Make a data request to view the table here!</b></div>
    }
    else{
        return <div></div>
    }
}
}

export default DataTable;