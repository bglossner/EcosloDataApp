import React from 'react'
import Button from 'react-bootstrap/Button';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import "../styles/index.css";


export const ExportCSV = ({csvData, fileName}) => {

    
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const exportToCSV = (csvData, fileName) => {
        console.log("csvData", csvData.rows)
        console.log("csvData", csvData)
        const ws = XLSX.utils.json_to_sheet(csvData.rows);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    return (

        <div class="row">
        <div class="col"></div>
        <div class="col"></div>
        <div class="col"></div>
        <div class="col">
        <Button variant="outline" size="sm" onClick={(e) => exportToCSV(csvData,fileName)}>Export Table</Button>
        </div>
        
        </div>
    )
}