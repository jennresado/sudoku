document.addEventListener('DOMContentLoaded', getUser);
document.addEventListener('DOMContentLoaded', setMsg);

/* Function to set response messages to none until needed */
function setMsg() {
  document.getElementById("tryAgain").style.display = 'none';
  document.getElementById('congrats').style.display = 'none';
}

/* Function to submit new user data for the database table */
function getUser(){
	document.getElementById('newUserSubmit').addEventListener('click', function(event){
        var req = new XMLHttpRequest();

        // Create JSON data to send with new user info and no id set
        var viewData = {
            userEmail : document.getElementById("newEmail").value,
            userFName : document.getElementById("fName").value,
            userLName : document.getElementById("lName").value,
        };
        req.open("POST", "/new_user", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // Add data to table
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
              var response = JSON.parse(req.responseText);
              var welcome = document.getElementById("congrats");
              var createPg = document.getElementById("createLink1");
              var pgLink = "<a href='/" + response.results[0].id + "/create'>entry</a>";
              createPg.innerHTML = pgLink;
              welcome.style.display = "block";
            }
            else {
              document.getElementById('tryAgain').style.display = "block";
            }});
        req.send(JSON.stringify(viewData));
        event.preventDefault();
    });
}
