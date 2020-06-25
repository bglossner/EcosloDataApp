import React from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Col, Row, Alert, Modal, Card } from "react-bootstrap"; 
import Table from "react-bootstrap/Table";
import DataTable from '../Components/DataTable.js';
import withLocations from '../Components/withLocations';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/page.css";
import { FaInfoCircle } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import { scroller, Element } from "react-scroll";



class View extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      help: false,
      dateStartVal: new Date(),
      dateEndVal: new Date(),
      displayReady: false,
      formData : {
        "location": null, 
        "dateStart" : null,
        "dateEnd": null,
      },
      locations: [],
      showAlert: false,
      groupByValues: [false, false],
      groupByDate: "Select Date Option...",
      aggregateFunctionValues: [false, false],
      pubPrivCols: [],
      pubPrivValues: [false, false],
      pubPrivSend: "",
      eventNamesSelected: [],

      columnNames : {
        "Key Information" : {
          "date" : null,
          "event_name" : null,
          "location": null,
          "public": null
        },
        "Most Likely To Find Items" : {
          "cigarette_butts" : null,
          "food_wrappers" : null,
          "plastic_take_out_containers" : null,
          "foam_take_out_containers" : null,
          "plastic_bottle_caps" : null,
          "metal_bottle_caps" : null,
          "plastic_lids" : null,
          "straws_and_stirrers" : null,
          "forks_knives_and_spoons" : null,
          "plastic_beverage_bottles" : null,
          "glass_beverage_bottles" : null,
          "beverage_cans" : null,
          "plastic_grocery_bags" : null,
          "other_plastic_bags" : null,
          "paper_bags" : null,
          "paper_cups_and_plates" : null,
          "plastic_cups_and_plates" : null,
          "foam_cups_and_plates" : null
        },
        "Fishing Gear" : {
          "fishing_buoys_pots_and_traps" : null,
          "fishing_net_and_pieces" : null,
          "fishing_line" : null,
          "rope" : null
        },
        "Packaging Materials" : {
          "six_pack_holders" : null,
          "other_plastic_or_foam_packaging" : null,
          "other_plastic_bottles" : null,
          "strapping_bands" : null,
          "tobacco_packaging_or_wrap" : null
        },
        "Personal Hygiene" : {
          "condoms" : null,
          "diapers" : null,
          "syringes" : null,
          "tampons" : null
        },
        "Other Trash": {
          "appliances" : null,
          "balloons" : null,
          "cigar_tips" : null,
          "cigarette_lighters" : null,
          "construction_materials" : null,
          "fireworks" : null,
          "tires" : null
        },
        "Tiny Trash" : {
          "foam_pieces" : null,
          "glass_pieces" : null,
          "plastic_pieces" : null
        },
        "Summary" : {
          "adult_volunteers" : null,
          "child_volunteers" : null,
          "distance_covered" : null,
          "total_items" : null,
          "trash_bags_filled" : null,
          "weight_trash" : null,
          "weight_recycle" : null
        },
        "Additional Items" : {
          "unusual_items" : null,
          "dead_animals" : null
        }
      }
    };

  }

  marginstyle={
    marginTop: '1.2em',
    marginBottom: '2em'
  }

  async componentDidMount(){
    try {

      if(this.state.eventNames === undefined) {
        let res = await this.props.apiWrapper.getEventNames();
        this.setState({eventNames: res.r})
      }

      let names = this.state.colNames
      if(names === undefined) {
        let res = await this.props.apiWrapper.getColumns();
        names = []
        for (var i = 0; i < res.r.fields.length; i++){
          names.push(res.r.fields[i].name)
        }
        this.setState({colNames: names})
        this.initSelectedValues()
      }

    }
    catch(err){

    }

    
  }


  scrollToDataTable() {
    scroller.scrollTo("top-of-data-table", {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
      offset: 5
    });
  }

  handleLocationChange (event) {
    let selected = []
    for(var i = 0; i < event.target.options.length; i++){
      if(event.target.options[i].value === 'Select All' && event.target.options[i].selected){
        selected=[]
        break;
      }
      else if (event.target.options[i].selected){
        selected.push(event.target.options[i].value)
      }
    }
    this.setState({locations: selected})
  }

  handleEventNameSelectionChange (event) {
    let selected = []
    for(var i = 0; i < event.target.options.length; i++){
      if(event.target.options[i].value === 'Select All' && event.target.options[i].selected){
        selected=[]
        break;
      }
      else if (event.target.options[i].selected){
        selected.push(event.target.options[i].value)
      }
    }
    this.setState({eventNamesSelected: selected})
  }

  formatDate(d) {

    var month = '' + (d.getMonth() + 1)
    var day = '' + d.getDate()
    var year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  };

  initDateValues(){
    let full = this.state.formData;
    full['dateStart'] = this.formatDate(new Date());
    full['dateEnd'] = this.formatDate(new Date());
    this.setState({
      formData: full
    })
  }

  handleStartDateChange(dateInput) {
    let full = this.state.formData;
    full['dateStart'] = this.formatDate(dateInput);
    this.setState({
      dateStartVal: dateInput,
      formData: full
    })
  };

  handleEndDateChange(dateInput) {
    let full = this.state.formData;
    full['dateEnd'] = this.formatDate(dateInput);
    this.setState({
      dateEndVal: dateInput,
      formData: full
    })
  };

  handleStringInputChange = (field, validationFunction = null) => event => {
    let curFormData = Object.assign({}, this.state.formData);
    const value = event.target.value;
    if (this.state.formData && (curFormData[field] !== value)) {
      if (validationFunction !== null) {
        if (validationFunction(value)) {
          alert("Invalid value: " + value);
          return false;
        }
      }
      curFormData[field] = value;
      this.setState({
        formData: curFormData
      });
    }
  }

  handleInputChange = (event, index) => {
    
    const target = event.target;
    const value = target.checked;
    let sv = this.state.selectedValues
    sv[index] = value
    this.setState({selectedValues: sv})
  }

  setShow(b) {
    this.setState({showAlert: b})
  }

  async handleSubmit(event) {
    event.preventDefault();

    if(this.state.colNames !== undefined) {
      var selected = []
      let data = this.state.columnNames
      var i = 0
      for(var key in data){
        for(var index in data[key]){
          if(data[key][index] !== null && this.state.selectedValues[i] === true){
            selected.push(this.state.colNames[i])
          }
        i += 1
        }
      }
      let p = ""
      if(this.state.pubPrivValues[0] === false && this.state.pubPrivValues[1] === false || this.state.pubPrivValues[0] === true && this.state.pubPrivValues[1] === true){
        p = "all"
      }
      else if(this.state.pubPrivValues[0] === true && this.state.pubPrivValues[1] === false){
        p = "true"
      }
      else{
        p = "false"
      }
      //CHECK FOR SELECTED SUM OR AVERAGE TOO
      if(this.state.groupByValues[0] === false && this.state.groupByValues[1] === false && this.state.groupByDate === "Select Date Option..." && this.state.aggregateFunctionValues[0] === false && this.state.aggregateFunctionValues[1] === false){
        var d = {
          dateStart: this.state.formData['dateStart'],
          dateEnd: this.state.formData['dateEnd'],
          cols: selected,
          locations: this.state.locations,
          eventNames: this.state.eventNamesSelected,
          public: p
        }
    
        try{
          let td = await this.props.apiWrapper.getByCols(d);
          if(td.rows !== undefined && td.rows.length !== 0){
            this.setState({tableData: td})
            this.scrollToDataTable();
          }
          else{
            alert("No data found. Try entering a different date range and location.")
          }
        }
        catch(e){
          alert("There was an error in your request. Please check your input and try again.")
        }
      }

      //GROUP BY
      else{
        var groupCols = []
        var aggregateFuncsSelected = []

        if(this.state.aggregateFunctionValues[0] === true){
          aggregateFuncsSelected.push("sum")
        }
        if(this.state.aggregateFunctionValues[1] === true){
          aggregateFuncsSelected.push("average")
        }

        
        if(this.state.groupByValues[0] === true){
          groupCols.push("location")
        
        }
        if(this.state.groupByValues[1] === true){
          groupCols.push("event_name")
        }
        if(this.state.groupByDate !== "Select Date Option..."){
          if(this.state.groupByDate === "Month and Year"){
            groupCols.push("monYear")
          }
          else if(this.state.groupByDate === "Full Date"){
            groupCols.push("date")
          }
          else{
            groupCols.push(this.state.groupByDate.toLowerCase())
          }
        
          
        }
        var q = {
          dateStart: this.state.formData['dateStart'],
          dateEnd: this.state.formData['dateEnd'],
          cols: selected,
          locations: this.state.locations,
          eventNames: this.state.eventNamesSelected,
          groupBy: groupCols, 
          aggregateFuncs: aggregateFuncsSelected,
          public: p
        }
        if(groupCols.length === 0 || aggregateFuncsSelected.length === 0){
          alert("You must select both a function option and a group event by option to use the aggregation section.")
        }
        else{
          try{
            let td = await this.props.apiWrapper.sumPerCol(q);
            if(td.rows !== undefined && td.rows.length !== 0){
              this.setState({tableData: td})
              this.scrollToDataTable();
            }
            else{
              alert("No data found. Try entering a different date range and location.")
            }
          }
          catch(e){
            alert("There was an error in your request. Please check your input and try again. If you used the aggregation section, you can only view columns that have a numeric value, and those that you selected in the group event by section.")
          }
        }

      }

    }
  }



   noDataAlert() {
    if(this.state.showAlert){
      return(
      <Alert variant="danger" onClose={() => this.setShow(false)} dismissible>
          <p>
            No data exists for these values. Try a different set of dates and locations.
          </p>
        </Alert>
      )
    }
    else {
      return null
    }
  }

  handleGroupByDateChange (event) {
    this.setState({groupByDate: event.target.value})
  }



  handleGroupByCheckbox = (e, col) =>{
    var duplicateVals = this.state.groupByValues
    if (col === "Location"){
      duplicateVals[0] = e.target.checked
      this.setState({groupByValues: duplicateVals})
    }
    if (col === "Event Name"){
      console.log(e.target.checked)
      duplicateVals[1] = e.target.checked
      this.setState({groupByValues: duplicateVals})
      console.log(this.state.groupByValues)
    }

  }

  handleAggregateFuncCheckbox = (e, functionType) => {
    var duplicateVals = this.state.aggregateFunctionValues
    if (functionType === "Sum"){
      duplicateVals[0] = e.target.checked
      this.setState({aggregateFunctionValues: duplicateVals})
    }
    if (functionType === "Average"){
      console.log(e.target.checked)
      duplicateVals[1] = e.target.checked
      this.setState({aggregateFunctionValues: duplicateVals})
      console.log(this.state.groupByValues)
    }
  }

  renderAggregationFunctionCheckBoxes = () => {
    if(this.state.colNames !== undefined){
      return(
        <div>
          <Form.Label className="big">Aggregate Functions</Form.Label>
          <FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}}
            data-tip="Optional. Check if you want to see totals or average numbers of each item found. If you select anything in this section, you must select a group event by option."
          />
          <div></div>
          <input type="checkbox"
            name="Sum"
            checked={this.state.aggregateFunctionValues[0]}
            onChange={(e) => this.handleAggregateFuncCheckbox(e, "Sum")}/> Sum
          <div></div>

          <input type="checkbox"
            name="Average"
            checked={this.state.aggregateFunctionValues[1]}
            onChange={(e) => this.handleAggregateFuncCheckbox(e, "Average")}/> Average
          <div></div>
        </div>
      )
    }
  }

renderGroupByCheckBoxes = () => {
  if(this.state.colNames !== undefined){
    return(
    <div>
      <Form.Label className="big">Group Events By</Form.Label>
      <FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}}
        data-tip="Optional. You can compress all rows based on shared date, location, and event name values into a single row. Use to generate totals."
      />
      <div></div>
      <input type="checkbox"
        name="Location"
        checked={this.state.groupByValues[0]}
        onChange={(e) => this.handleGroupByCheckbox(e, "Location")}/> Location
      <div></div>

      <input type="checkbox"
        name="Event Name"
        checked={this.state.groupByValues[1]}
        onChange={(e) => this.handleGroupByCheckbox(e, "Event Name")}/> Event Name
      <div>
        <Form.Control multiple={false} as="select" onChange={(e) => this.handleGroupByDateChange(e)} >
                    <option>Select Date Option...</option>
                    <option>Full Date</option>
                    <option>Month</option>
                    <option>Year</option>
                    <option>Month and Year</option>
                    
        </Form.Control>
      </div>
      <div></div>
      </div>
      );
    }
  }

renderPublicPrivateCheckBoxes = () => {
 if(this.state.colNames !== undefined){
    return(
    <div>
      <Form.Label className="big">Event Type</Form.Label><FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}}
          data-tip="Use to view either only private or only public events. Selecting no boxes is equivalent to selecting both boxes."
        />
      <div></div>
      <input type="checkbox"
        name="Public"
        checked={this.state.pubPrivValues[0]}
        onChange={(e) => this.handlePubPrivCheckbox(e, "Public")}/> Public
      <div></div>

      <input type="checkbox"
        name="Private"
        checked={this.state.pubPrivValues[1]}
        onChange={(e) => this.handlePubPrivCheckbox(e, "Private")}/> Private
      <div></div>
      </div>
      );
    }
}

handlePubPrivCheckbox = (e, col) =>{
  var duplicateVals = this.state.pubPrivValues
  if (col === "Public"){
    duplicateVals[0] = e.target.checked
    this.setState({pubPrivValues: duplicateVals})
  }
  if (col === "Private"){
    console.log(e.target.checked)
    duplicateVals[1] = e.target.checked
    this.setState({pubPrivValues: duplicateVals})
    console.log(this.state.pubPrivValues)
  }
}



 
 initSelectedValues = ()  => {
  if(this.state.colNames !== undefined){
  var counter = -1
  let data = this.state.colNames;
  var columns = this.state.columnNames;
  var values = []
  for(var i = 0; i < data.length; i=(i+1)){
    var added = false
    for(var key in columns){
      if(columns[key][data[i]] !== undefined){
        counter += 1
        columns[key][data[i]] = counter
        values.push(false)
        added = true
      }
    }
    if(added === false){
      counter += 1;
      columns["Additional Items"][data[i]] = counter
      values.push(false)
    }

  }
  this.setState({selectedValues : values})
  this.setState({columnNames : columns})

 }
}

changeAllGroupCheckboxes(e, group){
  let selectedGroupColumns = this.state.columnNames[group];
  let updatedSelectedValues = this.state.selectedValues;
  for(var [key, value] of Object.entries(selectedGroupColumns)){
    updatedSelectedValues[value] = e.target.checked;
  }

  this.setState({selectedValues: updatedSelectedValues});
}
  

  renderItemCheckboxes = ()  => {
    if(this.state.colNames !== undefined){
      let columns = this.state.columnNames;
      let checkboxGroups = Object.keys(columns).map((group, index)=> {
        let checkboxes = Object.keys(columns[group]).map((col, i)=> {
            if(columns[group][col] !== null){
              return(
                <td id="table">
                  <input type="checkbox"
                    name={col}
                    checked={this.state.selectedValues[columns[group][col]]}
                    onChange={(e) => this.handleInputChange(e, columns[group][col])}/>
                    {" " + col.split("_").join(" ")}
                </td>
              )
            }
            else{
              return null
            }
        })

        let rowGroups = [];
        while(checkboxes.length){
          rowGroups.push(checkboxes.splice(0, 5));
        }
        let rows = rowGroups.map((colArray, index) => {
          return(
            <tr>
              {colArray.map((col, i) => {
                  return(
                    col
                  );
              })}
            </tr>
          );
        })
        return(
          <div>
          <div className="thick">
            
            {group}
            <input type="checkbox" style={{marginLeft: '5px'}} onChange={(e) => this.changeAllGroupCheckboxes(e, group)} />
            {/* <FaCheckCircle style={{marginLeft: '5px', color: '#dd9933'}} onClick={(e) => this.selectAllGroupCheckboxes(e, group)}></FaCheckCircle> */}
            {/* <Button variant="outline" size="xs" onClick={(e) => this.selectAllGroupCheckboxes(e, group)}>Select All</Button> */}
          </div>
          <Table bordered hover size="sm">
          <tbody>
            {rows}
          </tbody>
          </Table>
          </div>
        )
      })
     return checkboxGroups;
    }
  else {
    return null
   }
  } 

  async handleViewAllData(e) {
    try{
      let td = await this.props.apiWrapper.getAllData();
      if(td.rows !== undefined && td.rows.length !== 0){
        this.setState({tableData: td})
        this.scrollToDataTable();
      }
      else{
        alert("No data found.")
      }
    }
    catch(e){
      alert("There was an error in your request. Please contact web admins.")
    }
  }


  displayHelpModal(){
    this.setState({help: true})
  }

  hideHelpModal(){
    this.setState({help: false})
  }



  render() {
    if(this.state.colNames !== undefined){
      if(this.state.formData['dateStart'] === null){
        this.initDateValues()
      }
      
    return (
      <div style={{backgroundColor: '#f4f8fa'}}>
      <div style={this.marginstyle}>
      <Modal size="lg" centered show={this.state.help} onHide={() => this.hideHelpModal()}>
        <Modal.Header closeButton>
          <Modal.Title>View Page Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <b>Purpose and Use</b>
          <br />
          The view page allows you to grab data from the database and view it in a table. The Select Which Items to View category determines which columns will be represented,
           while the Start Date, End Date, Location section, and Event Type options determine which rows will be shown. These filters can be used in any data request.
          <br /> <br />
          <b>Aggregation Section</b>
          <br />
          The Aggregation section allows you to compress rows by certain criteria. This section is optional, and can be used to get totals. You can select more than one option in this section. As an example, if you select Event Name in the group by section, you will see ONE row for every unique Event Name in the database. 
          The columns in a row will then be the sum of the counts, for each item, of all cleanups that have that Event Name.
          When using this section, you can only view columns in the table for which a sum can be computed. For example, if you choose to group by location, you cannot display the date.
          This is because there may be multiple dates for the many cleanups that are getting compressed into one row.
          <br /> <br />
          <b>Exporting Data</b>
          <br />
          The export button next to the table will download a copy of the table you are currently viewing into an excel spreadsheet.
          <br /> <br />
          <b>Example Without Aggregation</b>
          <br />
          Suppose you want to view data from cleanups in 2019 that were at Avila Beach and Morro Bay. To do this, you would select Date Start as '2019/01/01',
          Date End as '2019/12/31', and 'Avila Beach' and 'Morro Bay' from the Location section. This will determine which rows appear. Now say you want to see the number of cigarette butts
           found at these events. Then you would select 'date', 'location', and 'cigarette butts' from the Select Which Items to View section. This data request will produce a table with a row for every cleanup in 2019 at either of the locations specified,
            with three columns: date, location, and cigarette butts.
          <br /> <br />
          <b>Example With Aggregation</b>
          <br />
          Suppose you want to see the total number of cigarette butts found during each year from 2016 to 2018. You would input Date Start as '2016/01/01' and Date End as '2018/12/31'.
          You would choose 'Select All' in the Location section. In the Aggregation section, you would select 'Year' from the date options. Then you would select 'date' and 'cigarette butts' in the Select Which Items to View section.
          This will produce a table with three rows, assuming you have data for all three years, showing the date and the total number of cigarette butts found as columns.
        <br />
        </Modal.Body>
      
      </Modal>


        <Container>
          {this.noDataAlert()}
        <Form>
          
          <div>
          <Row>
                <Col style={{alignContent: 'right'}}>
                  <FaQuestionCircle className="float-right" onClick={(e) => this.displayHelpModal()}/>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h2>
                    View Your Cleanup Data
                  </h2>
                </Col>
                <Col style={{alignContent: 'right', alignItems: 'right'}}>
                  <Button className="float-right" variant="solid" size="sm" onClick={(e) => this.handleViewAllData(e)}>View All Data</Button>
                </Col>
              </Row>
              
              
            <Card>
                
                <Card.Body>
                <Card.Title>Select Which Events to View</Card.Title>
                  <Form.Group>
                      <Row>
                        <Col>
                          <Form.Label className="big">Start Date</Form.Label><FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}} data-tip="Required. You will see data from cleanups that occurred on or after this date. "/>
                          <ReactTooltip place="right" type="dark" effect="solid"/>
                          <br></br>
                            <DatePicker selected={this.state.dateStartVal} onChange={(e) => this.handleStartDateChange(e)} dateFormat={'yyyy/MM/dd'} />
                          <br></br>
                        </Col>
                        <Col>
                          <Form.Label className="big">End Date</Form.Label><FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}} data-tip="Required. You will see data from cleanups that occured on or before this date."/>
                          <br></br>
                            <DatePicker selected={this.state.dateEndVal} onChange={(e) => this.handleEndDateChange(e)} dateFormat={'yyyy/MM/dd'} />
                          <br></br>
                        </Col>
                      </Row>
                  </Form.Group>
                      
                  <Form.Group>
                    <Form.Label className="big">Location</Form.Label><FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}} data-tip="Required. You will see data only from cleanups at the locations you select. "/>
                      <Form.Control multiple={true} as="select" onChange={(e) => this.handleLocationChange(e)} >
                          <option>Select All</option>
                          { this.props.locations.map((value) => {
                            return <option>{value}</option>
                          }) }
                      </Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="big">Event Name</Form.Label><FaInfoCircle style={{marginLeft: '5px', color: '#dd9933'}} data-tip="Required. You will see data only from cleanups with the event names you select. "/>
                      <Form.Control multiple={true} as="select" onChange={(e) => this.handleEventNameSelectionChange(e)} >
                          <option>Select All</option>
                          { this.state.eventNames.map((value) => {
                            return <option>{value}</option>
                          }) }
                      </Form.Control>
                  </Form.Group>
                    
                  <Form.Group>
                      {this.renderPublicPrivateCheckBoxes()}
                  </Form.Group>
                </Card.Body>
            </Card>

            <div style={{margin: '20px'}}/>

            <Card>
              <Card.Body>
              <Card.Title>Select Aggregation Options</Card.Title>
                <Form.Group>
                  {this.renderAggregationFunctionCheckBoxes()}
                </Form.Group>
                <Form.Group>
                  {this.renderGroupByCheckBoxes()}
                </Form.Group>
              </Card.Body>
            </Card>

            <div style={{margin: '20px'}}/>

            <Card>
              <Card.Body>
              <Card.Title>Select Which Columns to View
              <FaInfoCircle style={{marginLeft: '5px', color: '#dd9933', width: '16', height: '16'}} data-tip="Required. You will see the items that you check as columns in the generated table."/>

              </Card.Title>
                {this.renderItemCheckboxes()}
              </Card.Body>
            </Card>

            <div style={{margin: '20px'}}/>

            <Button variant="solid" onClick={(e) => this.handleSubmit(e)}>Submit</Button>
          </div>
        </Form>
        </Container>
        <Element name="top-of-data-table"></Element>
        <DataTable showMessage data={this.state.tableData}></DataTable>
        
        
      </div>
</div>
      
    );

            }
            else{
              return null
            }
  }
}

export default withLocations(View);