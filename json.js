var mysql = require('mysql');

// http://nodejs.org/docs/v0.6.5/api/fs.html#fs.writeFile
var fs = require('fs');

var connection = mysql.createConnection({
   host: 'localhost',
   user: 'jeevitha',
   password: 'Jeevitha@123',
   database: 'dbms'
});

connection.connect();

function jsonify(){
	connection.query('select * from db.table;', function(err, results, fields) {
		if(err) throw err;

		fs.writeFile('table.json', JSON.stringify(results), function (err) {
		  if (err) throw err;
		  console.log('Saved!');
		});

		connection.end();
	});
}
