//  initialize
init();

function init() {
    document.addEventListener('DOMContentLoaded', bindButtons);
}

// add event listeners to buttons on first load
function bindButtons() {
    let deleteBtn = document.querySelector("#deleteEntry");
    let cancel = document.querySelector("#cancel");

    bindDelete(deleteBtn);
    bindCancel(cancel);
}

// bind delete button, on click, removes journal entry from db
function bindDelete(el) {
    el.addEventListener("click", function(err) {
        var req = new XMLHttpRequest;
        var body = {};
        body.id = parseInt(el.parentNode.children[1].value);
        req.open("DELETE", "http://localhost:3001/view", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function() {
            if (req.status >= 200 && req.status < 400) {
                window.location.href = "http://localhost:3001/view";
            } else {
                console.log(req.statusText);
            }
        });
        req.send(JSON.stringify(body));
        event.preventDefault();
    });
}

// bind cancel button, on click, reroute to user's journal page
function bindCancel(el) {
    el.addEventListener("click", function(err) {
        window.location.href = "http://localhost:3001/view";
    });
}