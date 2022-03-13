var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var select = require('./select');
const fs = require('fs')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var hbs = require('hbs');
var index = require('./index');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'jeevitha',
	password : 'Jeevitha@123',
	database : 'dbms'
});

var app = express();
var app1 = express();
let order_id = 1001;
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + ''));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
app1.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');
app1.set('view engine', 'hbs');

app1.use(logger('dev'));
app1.use(bodyParser.json());
app1.use(express.static(__dirname + ''));
app1.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app1.use(bodyParser.urlencoded({extended : true}));
app1.use(bodyParser.json());

app1.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});



app.get('/', function(request, response) {
	if (request.session.loggedin && request.session.username != 'admin'){
		response.redirect('/home');
	}
	else {
		response.sendFile(path.join(__dirname + '/html/index.html'));
	}
});

app.get('/adduser', function(request, response) {
	if (request.session.loggedin){
		response.redirect('/home');
	}
	else {
		response.sendFile(path.join(__dirname + '/html/adduser.html'));
	}
});


app.get('/home', function(request, response) {
	username = request.session.username;
	var redir = 'http://localhost:3002/id/' + username
	response.redirect(redir);
});

app.get('/test', function(request, response) {
	response.send(index.cart);
	console.log(index.cart);
});

app1.use('/', index);


app.get('/admin', function(request, response) {
	if (request.session.loggedin && request.session.username === 'admin'){
		response.sendFile(path.join(__dirname + '/html/admin.html'));
	}
	else {
		response.sendFile(path.join(__dirname + '/html/adminlogin.html'));
	}
});

app.get('/additems', function(request, response) {
	if (request.session.loggedin && request.session.username === 'admin'){
		//~ response.sendFile(path.join(__dirname + '/html/additems.html'));
		response.redirect('http://localhost:4300/additem');
	}
	else {
		response.sendFile(path.join(__dirname + '/html/adminlogin.html'));
	}
});

app.get('/manageorders', function(request, response) {
	if (request.session.loggedin && request.session.username === 'admin'){
		//~ response.sendFile(path.join(__dirname + '/html/additems.html'));
		connection.query('call updatebill()');
		response.redirect('http://localhost:4300/manage');
	}
	else {
		response.sendFile(path.join(__dirname + '/html/adminlogin.html'));
	}
});

app.get('/jsonify', function(request, response) {
	jsonify();
	response.redirect('/admin');
});

app.get('/delitems', function(request, response) {
	if (request.session.loggedin && request.session.username === 'admin'){
		//~ response.sendFile(path.join(__dirname + '/html/delitems.html'));
		response.redirect('http://localhost:4300/delitem');
	}
	else {
		response.sendFile(path.join(__dirname + '/html/adminlogin.html'));
	}
});

app.get('/show1', function(request, response) {
	response.sendFile(path.join(__dirname + '/html/show.html'));
});

app.get('/show' , function (req , res) {
    var i ;
   select.select( function (err, results) {
       if (err == 'error') {
           console.log(err);
       } else {
           console.log(results);
           var results1 = [];
           for(i=0;i<results.length;i++)
				results1[i] = results[i].item_name;
           res.send(results1);
       }
   });

});

app.post('/adminauth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				if (username == 'admin') {
					request.session.loggedin = true;
					request.session.username = username;
					//~ alert('Logged in successfully!')
					response.redirect('/admin');
				}
				else {
					
					request.session.loggedin = true;
					request.session.username = username;
					//~ alert('Logged in successfully!')
					response.redirect('/home');
				}
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/auth', function(request, response) {
	var phone = request.body.username;
	var table = request.body.table;
	request.session.table = table;
	if (phone && table) {
		connection.query('SELECT * FROM customer WHERE phone = ?', [phone], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = phone;
				request.session.order = order_id;
				connection.query('INSERT INTO orders (cust_id,datetime,table_no) values (?,?,?)', [request.session.username, getDateTime(), table]);
				connection.query('call updatebill()');
				//~ alert('Logged in successfully!')
				response.redirect('/home');
				
			} else {
				request.session.username = phone;
				response.redirect('/adduser');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/adduser', function(request, response) {
	var name = request.body.username;
		connection.query('INSERT INTO customer (name,phone) values (?,?) ', [name, request.session.username]);
		request.session.loggedin = true;
		request.session.order = order_id;
		connection.query('INSERT INTO orders (cust_id,datetime,table_no) values (?,?,?)', [request.session.username, getDateTime(), request.session.table]);
		connection.query('call updatebill()');
		response.redirect('/home');
		response.end();
});

app.get('/order/:cart', function(request, response) {
	var cart = request.params.cart;
	response.send(cart);
	//~ response.redirect('/home');
	response.end();
});

app.post('/additem', function(request, response) {
	var cat = request.body.category;
	var name = request.body.name;
	var price = request.body.price;
	connection.query('INSERT INTO menu (category,item_name,price) values (?,?,?)', [cat,name,price]);
	
	//~ response.redirect('/additems');
	response.redirect('http://localhost:4300/additem');
});

app.post('/delitem', function(request, response) {
	var type = request.body.type;
	var val = request.body.val;
	if(type=='id')
		connection.query('DELETE FROM menu WHERE item_id = ?', [val]);
	else if(type=='name')
		connection.query('DELETE FROM menu WHERE item_name = ?', [val]);
	//~ response.redirect('/delitems');
	response.redirect('http://localhost:4300/delitem');
});

app.get('/changepass', function(request, response) {
	if (request.session.loggedin){
		response.sendFile(path.join(__dirname + '/changepass.html'));
	}
	else {
		response.redirect('/admin');
	}
});

app.post('/cpwd', function(request, response) {
	var username = request.session.username;
	var password = request.body.password;
	var password1 = request.body.password1;
	var password2 = request.body.password2;
	//Add code to verify the current password.
	if (password2 === password1) {
		connection.query('UPDATE accounts set password = ? where username = ?', [password1, username]);
		//~ request.session.loggedin = false;
		response.redirect('/home');	
		response.end();
	} else {
		response.redirect('/login');
	}
	response.end();
	
});
app.get('/logout', function(request, response) {
	request.session.loggedin = false;
	response.redirect('/admin');
});



function jsonify(){
	connection.query('select * from menu', function(err, results, fields) {
		connection.query('call updatebill()');
		if(err) throw err;
		console.log(results);
		fs.writeFileSync('data/table.json', String(JSON.stringify(results)), function (err) {
		  if (err) throw err;
		  console.log('Saved!');
		});
		
		//~ fs.writeFile('data/table.json', JSON.stringify(results));

		connection.end();
	});
}



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app1.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app1.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


function getDateTime(){
	let date_ob = new Date();
	let date = ("0" + date_ob.getDate()).slice(-2);
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();
	let seconds = date_ob.getSeconds();
	var datetime = (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
	console.log(datetime);
	return datetime;
}


var port1 = 3001;
var port2 = 3002;

app.listen(port1, function () {
  console.log(`Server1 listening on port ${port1}!`);
});
app1.listen(port2, function () {
  console.log(`Server2 listening on port ${port2}!`);
});
