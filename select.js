var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "jeevitha",
    password: "Jeevitha@123",
    database: "dbms"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports  = {
    select: function (callback) {
        var sql = "SELECT * from menu ";
        con.query(sql, function (err, result , fields) {
            if (err) {
                callback("error", err)
            } else {
                callback("success", result)
            }
        });
    }
}
