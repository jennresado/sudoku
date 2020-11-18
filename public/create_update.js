//  initialize
init();

function init() {
    document.addEventListener('DOMContentLoaded', bindButtons);
}

// add event listeners to CRUD buttons on first load
function bindButtons() {
    let save = document.querySelector("#submitEntry");
    let update = document.querySelector("#updateEntry");
    let cancel = document.querySelector("#cancel");
    let addPokemon = document.querySelector("#add-pokemon");
    let removePokemons = document.querySelectorAll(".remove-pokemon");
    let removePokemonsEPL = document.querySelectorAll(".remove-pokemon-epl");

    if (save) {
        bindSave(save);
    } else {
        bindUpdate(update);
    }

    bindCancel(cancel);
    bindAddPokemon(addPokemon);

    for (let i = 0; i < removePokemons.length; i++) {
        bindRemovePokemon(removePokemons[i]);
    }

    for (let i = 0; i < removePokemonsEPL.length; i++) {
        bindRemovePokemonEPL(removePokemonsEPL[i]);
    }
}

// bind add entry, on click, post a request to save new entry to db
function bindSave(el) {
    el.addEventListener("click", function(err) {
        let req = new XMLHttpRequest;
        let body = {};
        let pokemonsSighted = document.querySelectorAll("#pokemonsSighted tr");
        body.userID = parseInt(document.querySelector("#userID").value);
        body.entryDate = document.querySelector("#date").value;
        body.city = titleCase(document.querySelector("#city").value);
        body.state = titleCase(document.querySelector("#state").value);
        body.pokemonsList = [];

        // NOTE: req.body.pokemonsList needs to be a list of lists [[pokemon, shiny], [pokemon, shiny], ...]
        for (let i = 0; i < pokemonsSighted.length ; i++) {
            let curPokemonInput = pokemonsSighted[i].id.split("-");
            let curPokemon = [];

            curPokemon.push(curPokemonInput[0].toLowerCase());

            if (curPokemonInput[1] == "true") {
                curPokemon.push(true);
            } else {
                curPokemon.push(false);
            }

            body.pokemonsList.push(curPokemon);
        }

        req.open("POST", "http://localhost:3001/validate", true);
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

// bind update entry, on click, put a request to update entry to db
function bindUpdate(el) {
    el.addEventListener("click", function(err) {
        let req = new XMLHttpRequest;
        let body = {};
        let pokemonsSighted = document.querySelectorAll("#pokemonsSighted tr");
        body.entryID = document.querySelector("#entryID").value;
        body.entryDate = document.querySelector("#date").value;
        body.city = titleCase(document.querySelector("#city").value);
        body.state = titleCase(document.querySelector("#state").value);
        body.pokemonsList = [];
        body.deletePokemons = [[0,0]];

        // insert into EPL only new rows of pokemon inputs
        // delete from EPL only hidden rows of pokemon inputs
        // let insertEPLQuery = "INSERT INTO entries_pokemons_locations (entryID, locationID, pokemonID) VALUES (?, (SELECT id FROM locations WHERE city=? AND state=?), (SELECT id FROM pokemons WHERE pokemon=? AND shiny=?))";
        // let deletePokemonsQuery = "DELETE FROM entries_pokemons_locations WHERE (entryID, pokemonID) in (?)";
        
        // NOTE: req.body.epl needs to be a list of lists [[entryID, city, state, pokemon, shiny], [entryID, city, state, pokemon, shiny], ...]
        // NOTE: req.body.deletePokemons needs to be a list of lists [[entryID, pokemonID], [entryID, pokemonID], ...]
        for (let i = 0; i < pokemonsSighted.length ; i++) {
            let curPokemon = [];

            if (pokemonsSighted[i].classList.contains("invisible")) {
                // if hidden, delete epl
                let curPokemonInput = pokemonsSighted[i].firstElementChild.id.split("-");

                curPokemon.push(parseInt(body.entryID));
                curPokemon.push(parseInt(curPokemonInput[3]));
                body.deletePokemons.push(curPokemon);
            } else {
                let curPokemonInput = pokemonsSighted[i].id.split("-");

                curPokemon.push(curPokemonInput[0].toLowerCase());

                if (curPokemonInput[1] == "true" || curPokemonInput[1] == 1) {
                    curPokemon.push(true);
                } else {
                    curPokemon.push(false);
                }

                body.pokemonsList.push(curPokemon);
            }
        }

        // if user updates an entry with no pokemons with pokemons, remove row from EPL where pokemonID is null
        if (body.pokemonsList.length > 0) {
            body.deletePokemons.push([body.entryID, null]);
        }

        req.open("PUT", "http://localhost:3001/view", true);
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

// bind add pokemon, on click, add pokemon to pokemon sighted list
function bindAddPokemon(el) {
    el.addEventListener("click", function(err) {
        let pokemonsSighted = document.querySelector("#pokemonsSighted");
        let pokemonNameInput = document.querySelector("#pokemon");
        let pokemonShinyInput = document.querySelector("#shiny");

        // add another row of pokemon to the pokemons sighted table
        let tr = document.createElement("tr");
        if (pokemonShinyInput.checked) {
            tr.id = pokemonNameInput.value.toLowerCase() + "-true";
        } else {
            tr.id = pokemonNameInput.value.toLowerCase() + "-false";
        }
        
        let nameTd = document.createElement("td");
        nameTd.textContent = pokemonNameInput.value.toLowerCase();
        tr.appendChild(nameTd);

        let shinyTd = document.createElement("td");
        if (pokemonShinyInput.checked == true) {
            shinyTd.textContent = 'yes';
        } else {
            shinyTd.textContent = 'no'
        }
        tr.appendChild(shinyTd);

        let removePokemonTd = document.createElement("td");
        removePokemonTd.textContent = "-"
        removePokemonTd.classList.add("remove-pokemon");
        bindRemovePokemon(removePokemonTd);
        tr.appendChild(removePokemonTd);

        pokemonsSighted.appendChild(tr);

        pokemonNameInput.value = '';
        pokemonShinyInput.checked = false;
    });
}

// bind remove pokemon button, on click, remove pokemon from sighted table
function bindRemovePokemon(el) {
    el.addEventListener("click", function(err) {
        el.parentNode.remove();
    });
}

// bind remove pokemon epl button, on click, hide pokemon from sighted table
function bindRemovePokemonEPL(el) {
    el.addEventListener("click", function(err) {
        el.parentElement.classList.add("invisible");
    });
}

// bind cancel button, on click, reroute to user's journal page
function bindCancel(el) {
    el.addEventListener("click", function(err) {
        window.location.href = "http://localhost:3001/view";
    });
}

// title case inputs
function titleCase(input) {
    var titleCased = input.toLowerCase().split(" ");
    for (i = 0; i < titleCased.length; i++) {
        titleCased[i] = titleCased[i][0].toUpperCase() + titleCased[i].slice(1);
    }
    titleCased = titleCased.join(" ");
    return titleCased;
}