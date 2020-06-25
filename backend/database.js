const Errors = require('./errors');

const dataTypeConverter = {
    "16": "boolean",
    "23": "numeric",
    "1700": "numeric",
    "1082": "string",
    "1043": "string"
}
const {Client} = require('pg');


module.exports = class Database {
    constructor(client) {

        this.noSumColumns = new Set();
        this.noSumColumns.add('date');
        this.noSumColumns.add('location');
        this.noSumColumns.add('unusual_items');
        this.noSumColumns.add('event_name');

        this.dbName = 'cleanupData2'

        this.client = client
        client.connect();
    }

    static create(env) {
        if (env == null) {
            return new Database(new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            }))
        }
        return null;
    }


    _createArgStr(row) {
        let values = [];
        let str = '';
        Object.keys(row).forEach((key, index) => {
            if (index > 0) {
                str += ', ';
            }
            str += key;
            values.push(row[key])
        })
        return [str, values];
    }

    _createValStr(row) {
        let str = '';
        Object.keys(row).forEach((key, index) => {
            if (index > 0) {
                str += ', ';
            }
            str += '$' + (index + 1);
        })
        return str;
    }

    _createRowQuery(row) {
        const keyvalues = this._createArgStr(row);
        const argStr = keyvalues[0];
        const valArray = keyvalues[1];
        const valStr = this._createValStr(row);
        const queryStr = 'INSERT INTO ' + this.dbName + ' (' + argStr + ') VALUES(' + valStr + ')';
        return [queryStr, valArray];
    }

    _validateDateRange(startDate, endDate) {
        if (startDate!=null && endDate!=null){
            return true;
        }
        else false;
    }

    _createUpdateQuery(colNames, vals, date, location) {
        var queryStr = 'UPDATE ' + this.dbName + ' SET ';
        if(colNames.length != vals.length){
            throw new Error(Error.badData);
        }
        for(var i =0; i < colNames.length; i++){
            queryStr+= colNames[i] + ' = ' + vals[i];
            if(i!=(colNames.length-1)){
                queryStr+= ', '
            }
        }
        queryStr+= ' WHERE date= \''+date+ '\' AND location= \'' + location + '\''

        return queryStr;
    }

    _createSelectQuery(colNames, dateStart, dateEnd, locations, isPublicString, eventNames) {
        var queryStr = 'SELECT ';
        var i;
        var continuing = false;
        for(i=0; i < colNames.length; i++){
            queryStr = queryStr.concat(colNames[i]);
            if (i != (colNames.length - 1)){
                queryStr = queryStr.concat(', ');
            }
        }
        queryStr+= ' FROM ' + this.dbName + ''
        if(this._validateDateRange(dateStart, dateEnd)){
            queryStr += ' WHERE (date BETWEEN \'' + dateStart + '\' AND \'' + dateEnd + '\')';
            if(locations!== null && locations.length !== 0){
                continuing=true;
            }
        }

        if(locations !== null && locations.length > 0 && locations[0] !== '' && locations.includes('*') === false){
            if(continuing) {
                queryStr += ' AND ('
            }
            else {
                queryStr+= ' WHERE ('
            }

            for(i=0; i < locations.length; i++){
                if(i===(locations.length-1)){
                    queryStr += 'location = \'' + locations[i] + '\''
                }
                else{
                    queryStr += 'location = \'' + locations[i] + '\' OR '
                }
            }
            queryStr+= ')'
        }

        if(isPublicString !== undefined && isPublicString !==null && isPublicString !== "all"){
            if(continuing) {
                queryStr += ' AND ('
            }
            else {
                queryStr+= ' WHERE ('
            }
            
            if(isPublicString==='true'){
                queryStr+= 'public = true'
            }
            if(isPublicString==='false'){
                queryStr+= 'public = false'
            }
            queryStr+= ')'
        }

        if(eventNames !== null && eventNames.length > 0 && eventNames[0] !== '' && eventNames.includes('*') === false){
            if(continuing) {
                queryStr += ' AND ('
            }
            else {
                queryStr+= ' WHERE ('
            }

            for(i=0; i < eventNames.length; i++){
                if(i===(eventNames.length-1)){
                    queryStr += 'event_name = \'' + eventNames[i] + '\''
                }
                else{
                    queryStr += 'event_name = \'' + eventNames[i] + '\' OR '
                }
            }
            queryStr+= ')'
        }


        return queryStr;
    }


    _createSelectSumQuery(colNames, dateStart, dateEnd, locations, groupBy, aggregateFuncs, isPublicString, eventNames) {
        console.log("groupBy: ", groupBy)
        var sum_cols = [];
        var avg_cols = [];
        var queryStr = 'SELECT ';
        var i;
        var continuing = false;
        for(i=0; i < colNames.length; i++){
            if(this.noSumColumns.has(colNames[i])){
                if(colNames[i] === 'date' && groupBy.includes('month')){
                    queryStr += 'extract(month from date) as month';
                }
                else if(colNames[i] === 'date' && groupBy.includes('year')){
                    queryStr += 'extract(year from date) as year';
                }
                else if(colNames[i] === 'date' && groupBy.includes('monYear')){
                    queryStr += 'extract(month from date) as month, extract(year from date) as year';
                }
                else{
                    queryStr = queryStr.concat(colNames[i]);
                }
            }
            else {
                var numAggregateFuncs = aggregateFuncs.length;
                if(aggregateFuncs.includes('sum')){
                    queryStr = queryStr.concat("SUM(case when " + colNames[i] + " >= 0 then " + colNames[i] + " else NULL end) as total_" + colNames[i]);
                    sum_cols.push(colNames[i])
                    if(numAggregateFuncs > 1){
                        queryStr = queryStr.concat(', ');
                    }
                }
                if(aggregateFuncs.includes('average')){
                    queryStr = queryStr.concat("TRUNC( AVG(case when " + colNames[i] + " >= 0 then " + colNames[i] + " else NULL end), 2) as average_" + colNames[i]);
                    avg_cols.push(colNames[i])
                }
            }
            if (i != (colNames.length - 1)){
                queryStr = queryStr.concat(', ');
            }
        
        }
        queryStr+= ' FROM ' + this.dbName + ''
        if(this._validateDateRange(dateStart, dateEnd)){
            queryStr += ' WHERE (date BETWEEN \'' + dateStart + '\' AND \'' + dateEnd + '\')';
            if(locations!== null && locations.length !== 0){
                continuing=true;
            }
        }

        if(locations !== null && locations.length > 0 && locations[0] !== '' && locations.includes('*') === false){
            if(continuing) {
                queryStr += ' AND ('
            }
            else {
                queryStr+= ' WHERE ('
            }

            for(i=0; i < locations.length; i++){
                if(i===(locations.length-1)){
                    queryStr += 'location = \'' + locations[i] + '\''
                }
                else{
                    queryStr += 'location = \'' + locations[i] + '\' OR '
                }
            }
            queryStr+= ')'
        }

        if(isPublicString !==null && isPublicString !== "all"){
            if(continuing) {
                queryStr += ' AND ('
            }
            else {
                queryStr+= ' WHERE ('
            }
            
            if(isPublicString==='true'){
                queryStr+= 'public = true'
            }
            if(isPublicString==='false'){
                queryStr+= 'public = false'
            }
            queryStr+= ')'
        }

        if(eventNames !== null && eventNames.length > 0 && eventNames[0] !== '' && eventNames.includes('*') === false){
            if(continuing) {
                queryStr += ' AND ('
            }
            else {
                queryStr+= ' WHERE ('
            }

            for(i=0; i < eventNames.length; i++){
                if(i===(eventNames.length-1)){
                    queryStr += 'event_name = \'' + eventNames[i] + '\''
                }
                else{
                    queryStr += 'event_name = \'' + eventNames[i] + '\' OR '
                }
            }
            queryStr+= ')'
        }

        continuing = false;
        queryStr += ' GROUP BY ';
        if(groupBy.includes('location')){
            queryStr += 'location';
            continuing = true;
        }
        if(groupBy.includes('event_name')) {
            if(continuing){
                queryStr += ', event_name'
            }
            else{
                queryStr += 'event_name';
                continuing = true;
            }
        }
        if(groupBy.includes('date')) {
            if(continuing){
                queryStr += ', date'
            }
            else{
                queryStr += 'date';
                continuing = true;
            }
        }
        else if(groupBy.includes('month')) {
            if(continuing){
                queryStr += ', extract(month from date)'
            }
            else{
                queryStr += 'extract(month from date)';
                continuing = true;
            }
        }
        else if(groupBy.includes('year')) {
            if(continuing){
                queryStr += ', extract(year from date)'
            }
            else{
                queryStr += 'extract(year from date)';
                continuing = true;
            }
        }
        else if(groupBy.includes('monYear')) {
            if(continuing){
                queryStr += ', extract(year from date), extract(month from date)'
            }
            else{
                queryStr += 'extract(year from date), extract(month from date)';
                continuing = true;
            }
        }

        queryStr += ';';
        return queryStr;
    }

    async add(row) {

        const queryStr = this._createRowQuery(row);
        
        console.log("queryString: ", queryStr[0])
        console.log("queryValues: ", queryStr[1])
        try {
            await this.client.query(queryStr[0], queryStr[1]);
        } catch (err) {
            console.log("ERROR");
            throw new Error(Errors.error.queryError);
        }
    }

    async getUserByUsername(username) {
        const queryString = `SELECT * FROM Users WHERE Username = $1`;
        console.log("queryStr, name: ", queryString, username);

        try {
            const result = await this.client.query(queryString, [username]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        } catch (err) {
            console.log("ERROR");
            console.log("err: ", err);
            throw new Error(Errors.error.queryError);
        }
    }

    async getUserById(id) {
        const queryString = `SELECT * FROM Users WHERE id = $1`;
        try {
            const result = await this.client.query(queryString, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        } catch (err) {
            console.log("ERROR");
            throw new Error(Errors.error.queryError);
        }
    }

    async getLocations() {
        const queryStr = 'SELECT DISTINCT location FROM ' + this.dbName + '';
        try {
            const result = await this.client.query(queryStr);
            let locations = [];
            for (const obj of result.rows) {
                locations.push(obj['location']);
            }
            return locations;
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }

    async getCols() {
        const queryStr = 'SELECT * FROM ' + this.dbName + '';
        try {
            const result = await this.client.query(queryStr);
            for(var i = 0; i < result.fields.length; i ++){
                result.fields[i].format = dataTypeConverter[`${result.fields[i].dataTypeID}`]
            }
            return result;
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }

    async getEventNames() {
        const queryStr = 'SELECT DISTINCT event_name FROM ' + this.dbName + '';
        try {
            const result = await this.client.query(queryStr);
            let eventNames = [];
            for (const obj of result.rows) {
                eventNames.push(obj['event_name']);
            }
            console.log("eventNames: ", eventNames)
            return eventNames;
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }

    async getByCol(req) {
        console.log("req", req.public)
        const queryStr = this._createSelectQuery(req.cols, req.dateStart, req.dateEnd, req.locations, req.public, req.eventNames);
        console.log("query", queryStr)
        try {
            const result = await this.client.query(queryStr);
            return result;
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }

    async update(req) {
        if(req.body.date == null || req.body.location == null){
            throw new Error(Errors.error.badData);
        }
        
        const queryStr = this._createUpdateQuery(req.body.cols, req.body.vals, req.body.date, req.body.location);

        try {
            const result = await this.client.query(queryStr);
            return result;
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }

    async alterTable(req) {
        if (req.body.action === null) {
            throw new Error(Errors.error.badData);
        }
        else{

            if(req.body.action === "add"){
                if(req.body.name === null || req.body.dataType === null){
                    throw new Error(Errors.error.badData);
                }
                if(req.body.dataType === 'DECIMAL'){
                    var queryStr = "ALTER TABLE " + this.dbName + " ADD COLUMN " + req.body.name + " " + req.body.dataType + " DEFAULT -1;"
                }
                else if(req.body.dataType === 'STRING'){
                    var queryStr = "ALTER TABLE " + this.dbName + " ADD COLUMN " + req.body.name + " " + 'VARCHAR(1000)' + " DEFAULT '';"
                }
                else if(req.body.dataType === 'BOOLEAN'){
                    var queryStr = "ALTER TABLE " + this.dbName + " ADD COLUMN " + req.body.name + " " + req.body.dataType + ";"
                }
                try {
                    const result = await this.client.query(queryStr);
                    return result;
                } catch (err) {
                    throw new Error(Errors.error.queryError);
                }
            }

            else if(req.body.action === "delete"){
                if(req.body.name === null){
                    throw new Error(Errors.error.badData);
                }
                var queryStr = "ALTER TABLE " + this.dbName + " DROP COLUMN " + req.body.name + ";"
                try {
                    const result = await this.client.query(queryStr);
                    return result;
                } catch (err) {
                    throw new Error(Errors.error.queryError);
                }
            }

        }
        
    }

    async sumPerCol(req) {
        console.log("req", req.public)
        const queryStr = this._createSelectSumQuery(req.cols, req.dateStart, req.dateEnd, req.locations, req.groupBy, req.aggregateFuncs, req.public, req.eventNames);
        console.log("query", queryStr)
        //console.log(queryStr)
        try {
            const result = await this.client.query(queryStr);
            return result
        } catch (err) {
            throw new Error(Errors.queryError);
        }
    }

    async deleteRow(req) {
        const queryStr = "DELETE FROM " + this.dbName + " WHERE date=$1 AND location=$2;" 
        try{
            const result = await this.client.query(queryStr, [req.body.date, req.body.location])
            return result;
        }
        catch(err) {
            throw new Error(Errors.queryError);
        }
    }

    async getAllData() {
        const queryStr = 'SELECT * FROM ' + this.dbName + '';
        try {
            const result = await this.client.query(queryStr);
            return result;
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }


    async database(req) {

        const queryStr = this._createSelectQuery(req.body.cols, req.body.dateStart, req.body.dateEnd, req.body.locations);

        try {
            const result = await this.client.query(queryStr);
            return result
        } catch (err) {
            throw new Error(Errors.error.queryError);
        }
    }

}