document.addEventListener('DOMContentLoaded', getTable);

// Function to remove existing table
function removeExisting() {
    var checkTable = document.getElementsByTagName("table");
    if (checkTable.length > 0) {
        checkTable[0].remove();
    }
}

// Function creates table based on data received from submitted forms
function createTable(tableData){
    // Check if current table exists on page and remove
    var currTable = document.getElementsByTagName("table");
    removeExisting();

    // Set up new Table - select where table will go
    var currItem = document.getElementById("viewTable");
    // Create variables with table, head, and body elements
    var theTbl = document.createElement("table");
    var theHead = document.createElement("thead");
    var theBody = document.createElement("tbody");
    // Create and add the cells for the table
    // Will create rows - 1 header row and # of entries from database
    for (var r = 0; r < tableData.length + 1; r++) {
        var row = document.createElement("tr");
        
        for (var c = 0; c < 7; c++) {
            // Create 7 columns per row
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
                else if (c == 4) {
                    hCell.textContent = "Date Sighted";
                }
                else if (c == 5) {
                    hCell.textContent = "Update Entry";
                }
                else {
                    hCell.textContent = "Delete Entry";
                }
			    hCell.style.border = "1px solid #363B81";
    	        row.appendChild(hCell);
            }
            // Create td cells for body rows
            else {
                var bCell = document.createElement("td");
                // Add pokemon to first column
                if (c == 0) {
                    if (!tableData[r-1].pokemon) {
                        bCell.textContent = "No pokemon sighted";
                    }
                    else {
                        bCell.textContent = tableData[r-1].pokemon;
                    }
                    // Check for additional pokemon for same entry ID
                    var p = r;
                    if (p != tableData.length) {
                        while (tableData[p-1].entryID == tableData[p].entryID) {
                            p += 1;
                            bCell.textContent = bCell.textContent + ", " + tableData[p-1].pokemon;
                            if (p == tableData.length) {
                                break;
                            }
                        }
                    }
                }
                else if (c == 1) {
                        // Determine if shiny and assign corresponding boolean to name
                        if (!tableData[r-1].pokemon) {
                            bCell.textContent = "N/A";
                        }
                        else if (tableData[r-1].shiny == 0) {
                            bCell.textContent = "normal";
                        }
                        else {
                            bCell.textContent = "shiny";
                        }
                        // Check for additional pokemon with same entryID
                        if (r != tableData.length) {
                            while (tableData[r-1].entryID == tableData[r].entryID) {
                                // Move row count forward to go to next entry when columns are complete
                                r += 1;
                                if (tableData[r-1].shiny == 0) {
                                    bCell.textContent = bCell.textContent + ", normal";
                                }
                                else {
                                    bCell.textContent = bCell.textContent + ", shiny";
                                }
                                if (r == tableData.length) {
                                    break;
                                }
                            }
                        }
                    }
                // Add city to third column
                else if (c == 2) {
                        bCell.textContent = tableData[r-1].city;
                }
                // Add state to fourth column
                else if (c == 3) {
                    bCell.textContent = tableData[r-1].state;
                }
                // Add date to fifth column
                else if (c == 4) {
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
               else {
                   // Create and add update button with link to user's entry id update page
                    var bodyText = document.createElement("button");
                    if (c == 5) {
                        bodyText.value = "Update"
                        bodyText.innerText = "Update";
                        bodyText.innerHTML = "<a href='/" + tableData[r-1].entryID + "/update'>Update</a>";
                    }
                    // Create and add delete button with link to user's id/entry id delete page
                    else {
                        bodyText.value = "Delete";
                        bodyText.innerHTML = "<a href='/" + tableData[r-1].userID + "/delete/" + tableData[r-1].entryID + "'>Delete</a>";
                    }
                    bodyText.style.backgroundColor = '#363b81';
                    bodyText.style.color = '#FFFFFF';
                    bodyText.style.borderRadius = '15px';
                    bCell.appendChild(bodyText);
                }
                bCell.style.border = bCell.style.border = "1px solid #363B81";
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
	document.getElementById('viewSubmit').addEventListener('click', function(event){
        var req = new XMLHttpRequest();
        document.getElementById("genUserMsg").style.display = 'none';
        // Create JSON data to send user email for entries
        var viewData = {
            userEmail : document.getElementById("userEmail").value,
        };
        req.open("POST", "/view", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Add data to table
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
              var response = JSON.parse(req.responseText);
              var table_title = document.getElementById("viewName");
              var createPg = document.getElementById("viewCreatePg");
              // Display message if no journal found and link to new user page
              if (response.results.length == 0) {
                table_title.textContent = "";
                createPg.innerHTML = "No journal found. Click <a href='/new_user'>here</a> to create one or check double check your entry.";
                removeExisting();
              }
              // Display table of entries entries found and link to user's id create page
              else if ('pokemon' in response.results[0]) {
                table_title.textContent = response.results[0].firstName + '\'s Journal';
                createPg.innerHTML = "Click <a href='/" + response.results[0].userID + "/create'>here</a> to add a new entry.";
                createTable(response.results);
              }
              // Display message if no entries were found and link to user's id create page
              else {
                table_title.textContent = "";
                createPg.innerHTML = "You don't having any entries yet, " + response.results[0].firstName + "! Click <a href='/" + response.results[0].id + "/create'>here</a> to add a new entry.";
                removeExisting();
              }
            }
            else {
              document.getElementsByTagName('body')[0].textContent = "Error status of " + req.statusText;
            }});
        req.send(JSON.stringify(viewData));
        event.preventDefault();
    })
}
