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
  var link1 = '/' + req.session.username;
  res.redirect(link1);
 
});

router.get('/:username', function (req, res, next) {
  req.session.username = req.params.username;
  res.render('index', 
  { 
    title: 'Coffee Shop',
    products: products
  }
  );
});

router.get('/order', function(req, res, next) {
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  res.send(req.session.username, " ", cart);
});

router.get('/add/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var product = products.filter(function(item) {
    return item.item_id == productId;
  });
  cart.add(product[0], productId);
  req.session.cart = cart;
  var link1 = '/' + req.session.username;
  res.redirect(link1);
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

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.remove(productId);
  req.session.cart = cart;
  res.redirect('/cart');
});
router.get('/showcart', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  res.send(cart);
});

module.exports = router;
