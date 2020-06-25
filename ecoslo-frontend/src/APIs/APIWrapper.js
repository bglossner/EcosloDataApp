const parseError = (statusCode, response) => {
    switch(statusCode) {
        case 401:
            return JSON.parse(response);
        default:
            return response;
    }
}

export default class APIWrapper {
    constructor(store) {
        // this.baseURL = "https://ecoslo-data-app.herokuapp.com:" + (process.env.PORT || 8000).toString() + '/';
        this.baseURL = "https://ecoslo-data-app.herokuapp.com/"
        this.store = store;
    }
    
    makeGetRequest(urlExtension, data = null, optionalResolve = null) {
        let queryString = "";
        if (data !== null) {
            queryString = "?" + Object.keys(data).map((key) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
            }).join('&');
        }

        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this.baseURL + urlExtension + queryString, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.withCredentials = true;
            xhr.onreadystatechange = function() {
                // Call a function when the state changes.
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        if (optionalResolve) {
                            optionalResolve(JSON.parse(this.response));
                            //optionalResolve(this.response);
                        } else {
                            resolve(JSON.parse(this.response));
                            //resolve(this.response);
                        }
                    } else {
                        reject(parseError(this.status, this.response));
                    }
                }
            };
            xhr.send();
        });
    }

    makeNonGetRequest(requestType, urlExtension, data = null, optionalResolve = null) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(requestType.toUpperCase(), this.baseURL + urlExtension, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.withCredentials = true;
            xhr.onreadystatechange = function() {
                // Call a function when the state changes.
                console.log(xhr.getAllResponseHeaders());
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        if (optionalResolve) {
                            //optionalResolve((this.response));
                            optionalResolve(JSON.parse(this.response));
                        } else {
                            resolve(JSON.parse(this.response));
                        }
                    } else {
                        reject((this.response));
                    }
                }
            };
            if (data !== null) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    }

    login(username, password) {
        if (
            username === null ||
            username.length === 0 ||
            password === null ||
            password.length === 0
        ) {
            return false;
        }

        return this.makeNonGetRequest(
            "POST",
            "login",
            {
                username : username,
                password : password
            }
        );
    }

    logout() {
        return this.makeGetRequest("logout");
    }

    addData(dataToBeSubmitted) {
        return this.makeNonGetRequest("POST", "add", {'item': dataToBeSubmitted});
    }

    alterTable(dataToBeSubmitted) {
        return this.makeNonGetRequest("POST", "altTable", dataToBeSubmitted);
    }

    getLocations() {
        return this.makeGetRequest("locations");
    }

    getColumns() {
        return this.makeGetRequest("columns");
    }

    getEventNames() {
        return this.makeGetRequest("eventNames");
    }

    getByCols(dataToBeSubmitted) {
        return this.makeGetRequest("byCols", dataToBeSubmitted);
    }

    sumPerCol(dataToBeSubmitted) {
        return this.makeGetRequest("sumPerCol", dataToBeSubmitted);
    }

    updateData(dataToBeSubmitted) {
        return this.makeNonGetRequest("PUT", "update", dataToBeSubmitted);
    }

    deleteRow(dataToBeSubmitted) {
        return this.makeNonGetRequest("PUT", "deleteRow", dataToBeSubmitted);
    }

    getAllData() {
        return this.makeGetRequest("allData");
    }
}