var express     = require("express"),
    app         = express(),
    handlebars  = require("express-handlebars").create({defaultLayout: "main"}),
    bodyParser  = require("body-parser"),
    mysql       = require('./dbcon.js'),
    port        = process.env.port || 9230;

app.use(express.static('public'));
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// SQL Queries for calling in various app.post routes
const insertQuery = 'INSERT INTO users (`email`, `firstName`, `lastName`) VALUES (?, ?, ?)';
const getUserId = 'SELECT id, firstName FROM users WHERE email=?';
const getUserEntries = 'SELECT u.firstName, tbl4.pokemon, tbl4.shiny, tbl4.city, tbl4.state, tbl4.entryDate, tbl4.userID, tbl4.entryID FROM users u INNER JOIN (SELECT p.pokemon, p.shiny, tbl3.city, tbl3.state, tbl3.entryDate, tbl3.userID, tbl3.entryID FROM pokemons p RIGHT JOIN (SELECT l.city, l.state, tbl2.entryID, tbl2.pokemonID, tbl2.userID, tbl2.entryDate FROM locations l INNER JOIN (SELECT e.userID, e.entryDate, tbl1.entryID, tbl1.locationID, tbl1.pokemonID FROM entries e INNER JOIN (SELECT epl.entryID, epl.locationID, epl.pokemonID FROM entries_pokemons_locations epl) as tbl1 ON e.id = tbl1.entryID AND e.locationID=tbl1.locationID) as tbl2 ON l.id = tbl2.locationID) as tbl3 ON p.id = tbl3.pokemonID) as tbl4 ON u.id = tbl4.userID AND u.email=? ORDER BY tbl4.entryDate, tbl4.entryID';
const pokemonOptions = 'SELECT DISTINCT pokemon FROM pokemons ORDER BY pokemon ASC';
const cityOptions = 'SELECT DISTINCT city FROM locations ORDER BY city ASC';
const stateOptions = 'SELECT DISTINCT state FROM locations ORDER BY state ASC';
const pokemonSightings = 'SELECT tbl3.pokemon, tbl3.shiny, tbl3.city, tbl3.state, e.entryDate FROM entries e INNER JOIN (SELECT l.city, l.state, tbl2.entryID, tbl2.pokemon, tbl2.shiny FROM locations l INNER JOIN (SELECT epl.entryID, epl.locationID, tbl1.pokemon, tbl1.shiny FROM entries_pokemons_locations epl INNER JOIN (SELECT * FROM pokemons p WHERE p.pokemon=?) as tbl1 ON epl.pokemonID = tbl1.id) as tbl2 ON l.id = tbl2.locationID) as tbl3 ON e.id = tbl3.entryID';
const citySightings = 'SELECT tbl3.pokemon, tbl3.shiny, tbl3.city, tbl3.state, e.entryDate FROM entries e INNER JOIN (SELECT p.pokemon, p.shiny, tbl2.entryID, tbl2.city, tbl2.state FROM pokemons p INNER JOIN (SELECT epl.entryID, epl.pokemonID, tbl1.city, tbl1.state FROM entries_pokemons_locations epl INNER JOIN (SELECT * FROM locations l WHERE l.city=?) as tbl1 ON epl.locationID = tbl1.id) as tbl2 ON p.id = tbl2.pokemonID) as tbl3 ON e.id = tbl3.entryID ORDER BY tbl3.pokemon ASC, tbl3.state ASC';
const stateSightings = 'SELECT tbl3.pokemon, tbl3.shiny, tbl3.city, tbl3.state, e.entryDate FROM entries e INNER JOIN (SELECT p.pokemon, p.shiny, tbl2.entryID, tbl2.city, tbl2.state FROM pokemons p INNER JOIN (SELECT epl.entryID, epl.pokemonID, tbl1.city, tbl1.state FROM entries_pokemons_locations epl INNER JOIN (SELECT * FROM locations l WHERE l.state=?) as tbl1 ON epl.locationID = tbl1.id) as tbl2 ON p.id = tbl2.pokemonID) as tbl3 ON e.id = tbl3.entryID ORDER BY tbl3.pokemon ASC, tbl3.state ASC';

// ROOT ROUTE
app.get("/", function(req, res, next){
    //var context = {}
    //context.message = 'setup successful';
    res.render('home');
});

// NEW USER ROUTE
app.get("/new_user", function(req, res, next){
    res.render('new_user');
})

// NEW USER ROUTE FOR DB QUERY - ADDS NEW USER TO DB
app.post("/new_user", function(req, res, next){
    // Set up variables to be passed to queries
    var { userEmail, userFName, userLName } = req.body;
    mysql.pool.query(insertQuery, [userEmail, userFName, userLName], (err, result) => {
        if(err){
            next(err);
            return;
        }
        else {
            console.log("new user request success");
            var context = {};
            // GET NEW USER'S ID TO SEND FOR CREATE ENTRY PAGE
            mysql.pool.query(getUserId, [userEmail], (err, rows) => {
                if(err){
                    next(err);
                    return;
                }
                else {
                    context.results = rows;
                    res.send(context);
                }
            });
        }
    });
});

// VIEW ROUTE
app.get("/view", function(req, res, next){
    res.render('view_journal');
});

// VIEW ROUTE FOR DB QUERY - GETS SELECTED USER'S ENTRIES FROM DB
app.post("/view", function(req, res, next){
    // Set up variables to be passed to queries
    var getUser = req.body.userEmail;
    mysql.pool.query(getUserEntries, [getUser], (err, rows) => {
        if(err){
            next(err);
            return;
        }
        else {
            console.log("view journal request success");
            var context = {};
            context.results = rows;
            if (context.results.length != 0) {
                res.send(context);
            }
            else {
                // IF NO ENTRIES FOR USER, GET USER'S ID TO SEND FOR CREATE ENTRY PAGE
                mysql.pool.query(getUserId, [getUser], (err, rows) => {
                    if(err){
                        next(err);
                        return;
                    }
                    else {
                        context = {};
                        context.results = rows;
                        res.send(context)
                    }
                });
            }
        }
    });
});

// CREATE ROUTE
app.get("/:userID/create", function(req, res, next) {
    let contents = {};
    contents.userID = req.params.userID;

    // retrieve all cities, states, and pokemons from db
    let citiesQuery = "SELECT DISTINCT city FROM locations";
    let statesQuery = "SELECT DISTINCT state FROM locations";
    let pokemonsQuery = "SELECT DISTINCT pokemon FROM pokemons";

    mysql.pool.query(
        [citiesQuery, statesQuery, pokemonsQuery].join("; "),
        function(err, result) {
            if (err) {
                console.log('error: ', err);
            }

            contents.locations = {};
            contents.locations.cities = result[0];
            contents.locations.states = result[1];
            contents.pokemons = result[2];

            res.render('create', contents);
        }
    );
});

// ROUTE FOR INSERT DB QUERY
app.post("/validate", function(req, res, next) {
    // insert new city, state into db
    mysql.pool.query(
        "INSERT IGNORE INTO locations (city, state) VALUES (?, ?)",
        [req.body.city, req.body.state],
        function(err, result) {
            if (err) {
                console.log('error: ', err);
            }

            // insert new pokemons in db
            // NOTE: req.body.pokemonsList needs to be a list of lists [[city, state], [city, state], ...]
            // https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js
            mysql.pool.query("INSERT IGNORE INTO pokemons (pokemon, shiny) VALUES ?", [req.body.pokemonsList], function(err, result) {
                if (err) {
                    console.log('error: ', err);
                }

                // insert new entry into db
                mysql.pool.query(
                    "INSERT INTO entries (locationID, userID, entryDate) VALUES ((SELECT id FROM locations WHERE city=? AND state=?), ?, ?)",
                    [req.body.city, req.body.state, req.body.userID, req.body.entryDate],
                    function(err, result) {
                        if (err) {
                            console.log('error: ', err);
                        }

                        let entryID = result.insertId;
                        let insertEPLQuery = 'INSERT INTO entries_pokemons_locations (entryID, locationID, pokemonID) VALUES ';
                        let values = [];

                        for (i = 0; i < req.body.pokemonsList.length; i ++) {
                            let curPokemon = req.body.pokemonsList[i];
                            values.push('(' + entryID + ', (SELECT id FROM locations WHERE city="' + req.body.city + '" AND state="' + req.body.state + '"), (SELECT id FROM pokemons WHERE pokemon="' +  curPokemon[0] + '" AND shiny=' + curPokemon[1] + '))');
                        }

                        if (values.length == 0) {
                            values.push('(' + entryID + ', (SELECT id FROM locations WHERE city="' + req.body.city + '" AND state="' + req.body.state + '"), NULL)');
                        }

                        // insert m:m relationship for entry, pokemons, locations into db
                        mysql.pool.query(insertEPLQuery + values.join(", "), function(err, result) {
                            if (err) {
                                console.log('error: ', err);
                            }
                            res.status(200).send("success");
                            }
                        );
                    }
                );
            });
        }
    );
})

// UPDATE ROUTE
app.get("/:entryID/update", function(req, res, next) {
    let contents = {};

    // retrieve entry and all cities, states, and pokemons from db
    let entryQuery = 'SELECT e.id, DATE_FORMAT(e.entryDate, "%Y-%m-%d") AS entryDate, l.id as lid, l.city, l.state, p.id as pid, p.pokemon, p.shiny FROM entries e LEFT JOIN entries_pokemons_locations epl ON e.id = epl.entryID LEFT JOIN locations l ON epl.locationID = l.id LEFT JOIN pokemons p ON epl.pokemonID = p.id WHERE e.id = ?';
    let citiesQuery = "SELECT DISTINCT city FROM locations";
    let statesQuery = "SELECT DISTINCT state FROM locations";
    let pokemonsQuery = "SELECT DISTINCT pokemon FROM pokemons";

    mysql.pool.query(
        [entryQuery, citiesQuery, statesQuery, pokemonsQuery].join("; "),
        [req.params.entryID],
        function (err, result) {
            if (err) {
                console.log("error: ", err);
            }

            contents.locations = {};
            contents.updateResult = result[0];
            contents.locations.cities = result[1];
            contents.locations.states = result[2];
            contents.pokemons = result[3];

            res.render('update', contents);
        }
    );
});

// ROUTE FOR UPDATE DB QUERY
app.put("/view", function(req, res, next) {
    // insert new pokemons into pokemons
    mysql.pool.query(
        "INSERT IGNORE INTO pokemons (pokemon, shiny) VALUES ?", 
        [req.body.pokemonsList],
        function(err, result) {
            if (err) {
                console.log("error: ", err);
            }

            // insert new city, state into locations
            mysql.pool.query(
                "INSERT IGNORE INTO locations (city, state) VALUES (?, ?)",
                [req.body.city, req.body.state],
                function(err, result) {
                    if (err) {
                        console.log("error: ", err);
                    }

                    // update entry in entries
                    mysql.pool.query(
                        "UPDATE entries SET locationID=(SELECT id FROM locations WHERE city=? AND state=?), entryDate=? WHERE id=?", 
                        [req.body.city, req.body.state, req.body.entryDate, req.body.entryID],
                        function(err, result) {
                            if(err) {
                                console.log("error: ", err);
                            } 

                            // update entry's location in EPL
                            mysql.pool.query(
                                "UPDATE entries_pokemons_locations SET locationID=(SELECT id FROM locations WHERE city=? AND state=?) WHERE entryID=?",
                                [req.body.city, req.body.state, req.body.entryID],
                                function (err, result) {
                                    if (err) {
                                        console.log("error: ", err);
                                    }

                                    // update entry's pokemons in EPL
                                    // insert into EPL only new rows of pokemon inputs
                                    // delete from EPL only hidden rows of pokemon inputs
                                    let insertEPLQuery = 'INSERT IGNORE INTO entries_pokemons_locations (entryID, locationID, pokemonID) VALUES ';
                                    let values = [];

                                    for (i = 0; i < req.body.pokemonsList.length; i ++) {
                                        let curPokemon = req.body.pokemonsList[i];
                                        values.push('(' + req.body.entryID + ', (SELECT id FROM locations WHERE city="' + req.body.city + '" AND state="' + req.body.state + '"), (SELECT id FROM pokemons WHERE pokemon="' +  curPokemon[0] + '" AND shiny=' + curPokemon[1] + '))');
                                    }

                                    if (values.length == 0) {
                                        let removeNullRow = 'DELETE FROM entries_pokemons_locations WHERE entryID=' + req.body.entryID + ' AND pokemonID IS NULL';
                                        insertEPLQuery = removeNullRow + "; " + insertEPLQuery;
                                        values.push('(' + req.body.entryID + ', (SELECT id FROM locations WHERE city="' + req.body.city + '" AND state="' + req.body.state + '"), NULL)');
                                    }

                                    // insert m:m relationship for entry, pokemons, locations into db
                                    mysql.pool.query(insertEPLQuery + values.join(", "), function(err, result) {
                                        if (err) {
                                            console.log('error: ', err);
                                        }

                                        let deletePokemonsQuery = "DELETE FROM entries_pokemons_locations WHERE (entryID, pokemonID) IN (?)";

                                        if (req.body.pokemonsList.length > 0) {
                                            deletePokemonsQuery = deletePokemonsQuery + ' OR entryID=' + req.body.entryID + ' AND pokemonID IS NULL';
                                        }
                                        
                                        mysql.pool.query(deletePokemonsQuery, [req.body.deletePokemons], function(err, result) {
                                            if (err) {
                                                console.log("error:", err);
                                            }
                                            res.status(200).send("success");
                                        });
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// DELETE ROUTE
app.get("/:userID/delete/:entryID", function(req, res, next) {
    let contents = {};

    // retrieve entry from db
    mysql.pool.query(
        'SELECT e.id, DATE_FORMAT(e.entryDate, "%m-%d-%Y") AS entryDate, l.city, l.state, p.pokemon, p.shiny FROM entries e LEFT JOIN entries_pokemons_locations epl ON e.id = epl.entryID LEFT JOIN locations l ON epl.locationID = l.id LEFT JOIN pokemons p ON epl.pokemonID = p.id WHERE e.id = ?',
        req.params.entryID,
        function(err, result) {
            if (err) {
                console.log('error: ', err);
            }

            let pokemonsStr = [];

            for (i = 0; i < result.length; i++) {
                if (result[i].shiny) {
                    pokemonsStr.push('shiny ' + result[i].pokemon);
                } else {
                    pokemonsStr.push(result[i].pokemon);
                }
                
            }

            contents.pokemonsList = pokemonsStr.join(", ");
            contents.deleteResult = result;

            res.render('delete', contents);
        }
    );
});

// ROUTE FOR DELETE DB QUERY
app.delete("/view", function(req, res, next) {
    mysql.pool.query("DELETE FROM entries WHERE id=?", [req.body.id], function(err, result) {
        if(err) {
            console.log("error: ", err);
        }
        res.status(200).send("success");
    });
});

// SIGHTINGS ROUTE
app.get("/sightings", function(req, res, next){
    let contents = {};

    // retrieve all cities, states, and pokemons from db
    mysql.pool.query(
        [cityOptions, stateOptions, pokemonOptions].join("; "),
        function(err, result) {
            if (err) {
                console.log("error: ", err);
            }

            contents.locations = {};
            contents.locations.cities = result[0];
            contents.locations.states = result[1];
            contents.pokemons = result[2];

            // Check for and remove empty pokemon
            for (p = 0; p < contents.pokemons.length; p ++) {
                if (contents.pokemons[p].pokemon == "") {
                    contents.pokemons.splice(p, 1);
                }
            }

            res.render('sightings', contents);
    });
});

// SIGHTINGS ROUTE FOR DB QUERY
app.post("/sightings", function(req, res, next){
    // Set up variables to be passed to queries
    var type = req.body.type;
    if (type == 'pokemon') {
        var pokeSelect = req.body.pokemon;
        mysql.pool.query(pokemonSightings, [pokeSelect], (err, rows) => {
            if(err){
                next(err);
                return;
            }
            else {
                console.log("sightings request success");
                var context = {};
                context.results = rows;
                console.log(context);
                res.send(context);
            }
        });
    }
    else if (type =='city') {
        var citySelect = req.body.city;
        mysql.pool.query(citySightings, [citySelect], (err, rows) => {
            if(err){
                next(err);
                return;
            }
            else {
                console.log("sightings request success");
                var context = {};
                context.results = rows;
                console.log(context);
                res.send(context);
            }
        });
    }
    else {
        var stateSelect = req.body.state;
        mysql.pool.query(stateSightings, [stateSelect], (err, rows) => {
            if(err){
                next(err);
                return;
            }
            else {
                console.log("sightings request success");
                var context = {};
                context.results = rows;
                console.log(context);
                res.send(context);
            }
        });
    }
});

// ADD LOCATION ROUTE
app.get("/addlocation", function(req, res, next) {
    let contents = {};
    // Get current locations
    mysql.pool.query(
        [cityOptions, stateOptions].join("; "),
        function(err, result) {
            if (err) {
                console.log('error: ', err);
            }

            contents.locations = {};
            contents.locations.cities = result[0];
            contents.locations.states = result[1];

            res.render('add_location', contents);
        }
    );
});

// LOCATIONS ROUTE FOR DB QUERY
app.post("/addlocation", function(req, res, next) {
    // insert new city and state into db
    mysql.pool.query(
        "INSERT IGNORE INTO locations (city, state) VALUES (?, ?)",
        [req.body.city, req.body.state],
        function(err, result) {
            if (err) {
                console.log('error: ', err);
            }
            else {
                res.send(result);
            }
    });
});


// ADD POKEMON ROUTE
app.get("/addpokemon", function(req, res, next) {
    let contents = {};
    // Get current pokemon
    mysql.pool.query(
        pokemonOptions,
        function(err, result) {
            if (err) {
                console.log('error: ', err);
            }

            contents.pokemons = result;

            res.render('add_pokemon', contents);
        }
    );
});

// POKEMON ROUTE FOR DB QUERY
app.post("/addpokemon", function(req, res, next) {
    // insert new pokemons in db
    if (req.body.pokemonsList[0]){ 
    // NOTE: req.body.pokemonsList needs to be a list of lists [[city, state], [city, state], ...]
    // https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js
        mysql.pool.query("INSERT IGNORE INTO pokemons (pokemon, shiny) VALUES ?", [req.body.pokemonsList], function(err, result) {
            if (err) {
                console.log('error: ', err);
            }
            else {
                res.send(result);
            }
        });
    }
    else {
        console.log("pokemon not selected")
    }
});

app.use(function(req, res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(port, function(){
    console.log(`Express started on http://${process.env.HOSTNAME}:9229; press Ctrl-C to terminate.`);
});
