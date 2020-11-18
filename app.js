var express     = require("express"),
    app         = express(),
    handlebars  = require("express-handlebars").create({defaultLayout: "main"}),
    bodyParser  = require("body-parser"),
    port        = process.env.port || 3001;

    app.use(express.static('public'));
    app.engine("handlebars", handlebars.engine);
    app.set("view engine", "handlebars");
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
      
    // ROOT ROUTE
    app.get("/", function(req, res, next){
        //var context = {}
        //context.message = 'setup successful';
        res.render('home');
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
        console.log(`Express started on ${port}; press Ctrl-C to terminate.`);
    });
    