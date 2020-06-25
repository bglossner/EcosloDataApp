const Express = require('express');
const session = require("express-session");
const AppError = require('./errors');
const Database = require('./database');
const cors = require('cors');
const bodyParser = require('body-parser');

const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const JWTStrategy = require('passport-jwt').Strategy;
const bcrypt = require('bcrypt');

const tempDB = require('./temp_db');
const User = require('./User');
const Auth = require('./authentication');

const path = require('path');

const app = Express();

const usingProduction = process.env.NODE_ENV === 'production';


const whiteListedOrigins = ['http://localhost:3000', 'https://ecoslo-data-app.herokuapp.com'];
const corsOptions = {
	origin : (origin, callback) => {
		if(origin === undefined){
			console.log("here");
		}
		else{
			if (whiteListedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				console.log(new Error(`${origin} is not whitelisted for CORS`));
			}
		}
	},
	optionsSuccessStatus : 200,
	credentials : true,
};


// app.use(cors(corsOptions));
// app.options(cors(corsOptions));

app.use(Express.json());

//no auth
// app.use(cors());
// app.options('*', cors());


const database = Database.create(null);


app.use(Express.static(path.resolve(__dirname, '../ecoslo-frontend/build')));


app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

//AUTH
console.log("secrest session: ", process.env.SESSION_SECRET);
console.log("use prod: ", usingProduction);
app.use(session({ 
	secret: usingProduction ? process.env.SESSION_SECRET : 'keyboard cat',
	resave : false,
	saveUninitialized: false,
	cookie: { secure: false, maxAge : 7200000, httpOnly : false }
}));

app.use(passport.initialize());

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	console.log("id: ", id);
	done(null, new User.User(null, null, id));
});


if (!usingProduction && process.env.USE_TEMP_DB) {
	console.log("Using temp database (temp_db.js)");
	database = tempDB;
}
Auth.initializeLocalStrat(database);



app.post('/login', cors(corsOptions), async (req, res) => {
	passport.authenticate('local', (err, user, info) => {
		if (err !== null || !user) {
			if (err !== null) {
				res.status(500).send(AppError.stringError(err.message));
			} else {
				res.status(401).json({
					message : info.message
				});
			}
		} else {
			req.logIn(user, async (error) => {
				if (error) {
					console.log(error)
					return res.status(500).send(error);
				} else {
					return res.status(200).json({ 
						message : "Login successful!"
					});
				}
			});
		}
	})(req, res);
});

/**
 * Start of endpoints requiring valid session and thus authorization (authenticated)
 */



app.use(passport.session()); // PLACE BEFORE ALL ENDPTS THAT NEED AUTH

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/login');
});

 app.post('/add', Auth.isAuthenticated, async (req, res) => {
	// app.post('/add', async (req, res) => {
	try {
		let result = await database.add(req.body.item);
		res.status(200).json({})
	} catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
});

// app.post('/login', async (req, res) => {
// 	res.status(200).send(req.body.username + "   " + req.body.password);
	
// })

app.post('/altTable', Auth.isAuthenticated, async (req, res) => {
	try {
		await database.alterTable(req);
	} catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
	res.status(200).json({});
});

app.get('/locations', Auth.isAuthenticated, async (req, res) => {
	try {
		let result = await database.getLocations();
		res.status(200).json({
			locations : result
		});
		
	}
	catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
})

app.get('/columns', Auth.isAuthenticated, async (req, res) => {
	try{
		let r = await database.getCols();
		res.status(200).json({
			r
		});
	}
	catch (err) {	
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
})

app.get('/eventNames', Auth.isAuthenticated, async (req, res) => {
	try{
		let r = await database.getEventNames();
		res.status(200).json({
			r
		});
	}
	catch (err) {	
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
})

app.get('/byCols', Auth.isAuthenticated, async (req, res) => {
	try{
		let queryParams = req.query;
		if ("cols" in queryParams) {
			queryParams["cols"] = queryParams["cols"].split(",");
		}
		if ("locations" in queryParams) {
			queryParams["locations"] = queryParams["locations"].split(",");
		}
		if ("eventNames" in queryParams) {
			queryParams["eventNames"] = queryParams["eventNames"].split(",");
		}
		let result = await database.getByCol(queryParams);
		res.status(200).json({
			rows : result.rows
		});
	}
	catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
})

app.get('/allData', Auth.isAuthenticated, async (req, res) => {
	try{
		let result = await database.getAllData();
		res.status(200).json({
			rows : result.rows
		});
	}
	catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
})

app.get('/sumPerCol', Auth.isAuthenticated, async (req, res) => {
	try{
		let queryParams = req.query;
		if ("cols" in queryParams) {
			queryParams["cols"] = queryParams["cols"].split(",");
		}
		if ("locations" in queryParams) {
			queryParams["locations"] = queryParams["locations"].split(",");
		}
		if ("eventNames" in queryParams) {
			queryParams["eventNames"] = queryParams["eventNames"].split(",");
		}
		if ("groupBy" in queryParams) {
			queryParams["groupBy"] = queryParams["groupBy"].split(",");
		}
		if("aggregateFuncs" in queryParams) {
			queryParams["aggregateFuncs"] = queryParams["aggregateFuncs"].split(",");
		}
		let result = await database.sumPerCol(queryParams);
		res.status(200).json({
			rows : result.rows
		});
	}
	catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
});

app.put('/update', Auth.isAuthenticated, async (req, res) => {
	try{
		const result = await database.update(req);
		if (result.rowCount > 0) {
			res.status(200).json({
				message : "Worked"
			});
		} else {
			res.status(500).json({
				error : "Failed on the backend"
			});
		}
	}
	catch (err) {
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
});

app.put('/deleteRow', Auth.isAuthenticated, async (req, res) => {
	try{
		const result = await database.deleteRow(req);
		res.status(200).json({
			rows : result.rows
		});
	}
	catch(err){
		res.status(400).send(AppError.stringError(err.message));
		return;
	}
})



app.get('/view', function (req, res) {
	if(req.user === null || req.user === undefined){
		res.redirect('/login')
	}
	else{
		res.sendFile(path.resolve(__dirname, '../ecoslo-frontend/build', 'index.html'));
	}
});

app.get('/update', function (req, res) {
	if(req.user === null || req.user === undefined){
		res.redirect('/login')
	}
	else{
		res.sendFile(path.resolve(__dirname, '../ecoslo-frontend/build', 'index.html'));
	}
});

app.get('/alter', function (req, res) {
	if(req.user === null || req.user === undefined){
		res.redirect('/login')
	}
	else{
		res.sendFile(path.resolve(__dirname, '../ecoslo-frontend/build', 'index.html'));
	}
});


app.get('/add', function (req, res) {
	if(req.user === null || req.user === undefined){
		res.redirect('/login')
	}
	else{
		res.sendFile(path.resolve(__dirname, '../ecoslo-frontend/build', 'index.html'));
	}
})

app.get('*', function(request, response) {
		response.sendFile(path.resolve(__dirname, '../ecoslo-frontend/build', 'index.html'));
});



app.listen(process.env.PORT || 8000);