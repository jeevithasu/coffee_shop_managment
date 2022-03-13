var express = require('express');
//~ var routes = require('./routes');
var http = require('http');
var path = require('path');
var session = require('express-session');
//Including controller/dao for testtable
var additem = require('./routes/additem');
var delitem = require('./routes/delitem');
var manage = require('./routes/manage');
var order = require('./routes/order');
var app = express();
var connection  = require('express-myconnection');
var mysql = require('mysql');
// all environments
app.set('port', process.env.PORT || 4300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//~ app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
//~ app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, '')));
// development only
//~ if ('development' == app.get('env')) {
  //~ app.use(express.errorHandler());
//~ }
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

var connection1 = mysql.createConnection({
	host     : 'localhost',
	user     : 'jeevitha',
	password : 'Jeevitha@123',
	database : 'dbms'
});

app.use(
    connection(mysql,{

        host: 'localhost',
        user: 'jeevitha',
        password : 'Jeevitha@123',
        port : 3306, //port mysql
        database:'dbms'
},'pool')
);
app.get('/additem', additem.list);
app.get('/delitem', delitem.list);
app.get('/manage', manage.list);

app.post('/manage', function(request, response) {
	request.session.orderid = request.body.name;
	console.log(request.session.orderid);
	exports.orderid = request.session.orderid;
	
	response.redirect('/vieworder');
});

app.post('/getbill', function(request, response) {
	request.session.table = request.body.name;
	console.log(request.session.table);
	exports.orderid = request.session.orderid;
	connection1.query("select sum(tot_amount) as price from orders where table_no = ? and status not like 'closed'", [request.session.table], function(err,rows){
			console.log(rows);
			console.log(rows[0].price);
			
			var billamt = rows[0].price;
			if(billamt==null)
				billamt=0;
			console.log('Bill amount: ', billamt);
			response.send(`<script>
			alert("Bill Amount is: " +`+String(billamt)+`);
	
			</script>`);
		
	});
	connection1.query("UPDATE orders SET status = 'Closed' where table_no = ?", [request.session.table]);
});

app.post('/close', function(request, response) {
	request.getConnection(function(err,connection){
		var query = connection.query("UPDATE orders SET status = 'Closed' where order_id = ?", [request.session.orderid]);	
		response.redirect('/manage');
	});
});

app.get('/vieworder', order.list);



//~ app.use(app.router);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});
