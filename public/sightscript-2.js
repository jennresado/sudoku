document.addEventListener('DOMContentLoaded', getTable);

// Function creates table based on data received from submitted forms
function createTable(tableData){
    // Check if current table exists on page and remove
    var currTable = document.getElementsByTagName("table");
    if (currTable.length > 0) {
        currTable[0].remove();
    }
    // Set up new Table - Select where table will be added
    var currItem = document.getElementById("sightTable");
    // Create variables with table, head, and body elements
    var theTbl = document.createElement("table");
    var theHead = document.createElement("thead");
    var theBody = document.createElement("tbody");
    // Create and add the cells for the table
    // Will create rows - 1 header row and # entries from database query
    for (var r = 0; r < tableData.length + 1; r++) {
        var row = document.createElement("tr");
        
        for (var c = 0; c < 5; c++) {
            // Create 5 columns per row
            // Create th cells for header row
		    if (r === 0) {
                var hCell = document.createElement("th");
                if (c == 0) {
                    hCell.textContent = "Pokemon Name";
                }
                else if (c == 1) {
                    hCell.textContent = "Is Shiny?";
                }
                else if (c == 2) {
                    hCell.textContent = "City";
                }
                else if (c == 3) {
                    hCell.textContent = "State";
                }
                else {
                    hCell.textContent = "Date Sighted";
                }
			    hCell.style.border = "1px solid #363B81";
    	        row.appendChild(hCell);
            }
            // Create td cells for body rows
            else {
                var bCell = document.createElement("td");
                // Add pokemon to first column of row
                if (c == 0) {
                    bCell.textContent = tableData[r-1].pokemon;
                }
                else if (c == 1) {
                        // Determine if shiny and assign corresponding boolean to name
                        if (tableData[r-1].shiny == 0) {
                            bCell.textContent = "normal";
                        }
                        else {
                            bCell.textContent = "shiny";
                        }
                    }
                // Add city to third column of row
                else if (c == 2) {
                        bCell.textContent = tableData[r-1].city;
                }
                // Add state to fourth column of row
                else if (c == 3) {
                    bCell.textContent = tableData[r-1].state;
                }
                // Add date to fifth column of row
                else {
                // Convert date received from database and enter in a date text
                    var newDate = new Date(tableData[r-1].entryDate);
                    var newMonth = newDate.getMonth() + 1;
                    var newDay = newDate.getDate();
                    var newYear = newDate.getFullYear();
                    if (newMonth < 10) {
                        newMonth = "0" + newMonth;
                    }
                    if (newDay < 10) {
                        newDay = "0" + newDay;
                    }
                    bCell.textContent = newMonth + "/" + newDay + "/" + newYear;
               }
                bCell.style.border = "1px solid #363B81";
    	        row.appendChild(bCell);
            }
        }
        // Add first row to table header
	    if (r === 0) {
  	        theHead.appendChild(row);
        }
        else {
        // Add remaining rows to table body
        theBody.appendChild(row);  
        }
    }

    // Put the head and body in table and attach table to document body
    theTbl.appendChild(theHead);
    theTbl.appendChild(theBody);
    currItem.appendChild(theTbl);
    // Create outer table border
    theTbl.style.border = "1px solid #363B81";
}

/* Function to submit user data for the database table */
function getTable(){
	document.getElementById('sightSubmit').addEventListener('click', function(event){
        var req = new XMLHttpRequest();

        var newSelect = document.getElementById('searchType').value;

        // Create JSON to get search results
        if (newSelect == "Pokemon") {
            var sightData = {
                type : 'pokemon',
                pokemon : document.getElementById("pokemonList").value,
            };
        }

        else if (newSelect == "City") {
            var sightData = {
                type : 'city',
                city : document.getElementById("cityList").value,
            }
        }
 
        else {
            var sightData = {
                type : 'state',
                state : document.getElementById("stateList").value,
            }
        }

        req.open("POST", "/sightings", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Add data to table
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
              var response = JSON.parse(req.responseText);
              createTable(response.results);
            }
            else {
              document.getElementsByTagName('body')[0].textContent = "Error status of " + req.statusText;
            }});
        req.send(JSON.stringify(sightData));
        event.preventDefault();
    })
}
