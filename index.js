var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');

var Cart = require('./models/cart');
var products = JSON.parse(fs.readFileSync('./data/table.json', 'utf8'));
var app1 = require('./app');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'jeevitha',
	password : 'Jeevitha@123',
	database : 'dbms'
});

router.get('/', function (req, res, next) {
	console.log(req.session.username, " accessed the page.");
  res.render('index', 
  { 
    title: 'Coffee Shop',
    products: products
  }
  );
});

router.get('/id/:username', function (req, res, next) {
  req.session.username = req.params.username;
  res.redirect('/');
});

router.get('/order', function(req, res, next) {
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  console.log('getting id of ', req.session.username);
  connection.query('select order_id from orders where cust_id = ? order by datetime desc;', [req.session.username], function(error, results, fields) {
			if(error)
				throw error;
			 //~ var oid = String(results[0].order_id);
			 var oid = results[0].order_id;
			 console.log('order id: ', oid);
			 req.session.order_id = oid;
			console.log(cart.totalItems);
			for(var i=1;i<=cart.totalItems; i++){
				  var cart1 = cart.getItems();
				  console.log(req.session.order_id,cart1[i-1].item.item_id,cart1[i-1].quantity);
				  connection.query('insert into bill values(?,?,?)', [req.session.order_id,cart1[i-1].item.item_id,cart1[i-1].quantity]);
				  connection.query('call updatebill()');
			  }
			//~ for(var i=1;i<=cart.totalItems; i++){
				//~ console.log(req.session.order_id, cart.items[i-1].item.item_id, cart.items[i-1].item.quantity);
				connection.query('insert into bill values(?,?,?)', []);
		//~ }
		});
	req.session.cart = {};
  res.redirect('/success');
 
});

router.get('/add/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var product = products.filter(function(item) {
    return item.item_id == productId;
  });
  cart.add(product[0], productId);
  req.session.cart = cart;
  res.redirect('/');
});

router.get('/test', function(req, res, next) {
	res.send(app1.getDateTime());
	console.log(app1.getDateTime());
  //~ console.log(app1.name);
  //~ console.log(app1.order_id);
  //~ console.log(app1.request.session.username);
});

router.get('/cart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('cart', {
      products: null
    });
  }
  var cart = new Cart(req.session.cart);
  res.render('cart', {
    title: 'Coffee Shop',
    products: cart.getItems(),
    totalPrice: cart.totalPrice
  });
});

router.get('/success', function(req, res, next) {
	console.log(req.session.order_id);
	var orderNumber = req.session.order_id;
  res.render('success');
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;
  res.redirect('/cart');
});
router.get('/showcart', function(req, res, next) {
  //~ var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  console.log(cart.totalItems);
  for(var i=1;i<=cart.totalItems; i++){
	  
	  //~ console.log(cart.item[i].item_id);
	  var cart1 = cart.getItems();
	  //~ console.log(cart1[i].item_id);
	  console.log(cart1[i-1].item.item_id);
	  
  }
  res.send(cart);
});

function getOrderNum(username){
	connection.query('select order_id from orders where cust_id = ? order by datetime desc;', [username], function(error, results, fields) {
			return(results);
		});
}

module.exports = router;
