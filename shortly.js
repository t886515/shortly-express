var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');
var crypto = require('crypto');

var app = express();

app.set('port', 4568);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'why'
}));

app.use(function(req, res, next) {
  console.log('Serving ' + req.method + ' for ' + req.url);
  next();
});

app.get('/', util.isLoggedOn, function(req, res) {
  // if () {
  //   res.render('index');
  // }
  res.render('index');
});

app.post('/login', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  
  new User({ username: username }).fetch().then(function(found) {
    //console.log(found);
    // console.log(found);
    //console.log();
    if (!found) {
      res.redirect('/login');
    } else {
      // var hashVersion = crypto.createHash('sha1').update(password).digest('hex').slice(0, 5);
      bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash, 'this is hashhhh');
        console.log(found.attributes.password);
        bcrypt.compare(hash, found.attributes.password, function(err, res) {
          console.log(res);
          console.log(err);
          if (res) {
            req.session.loggedIn = true;
            res.redirect('/');
          }
        });
      });
      // bcrypt.compare(password, found.attributes.password, function(err, res) {
      //   console.log(res);
      //   console.log(err);
      //   if (res) {
      //     req.session.loggedIn = true;
      //     res.redirect('/');
      //   }
      // });
    //console.log(found.attributes.password);
    //   if (hashVersion === found.attributes.password) {
    //     req.session.loggedIn = true;
    //     res.redirect('/');
    //   }
    // //
    }
    
  });
  //res.redirect('/');
  //Get user data from request
    //compare it with whats sotred in our db
    //If it matches give thema session and redirect to '/'
});

app.get('/logout', (req, res) => {
  req.session.destroy(function() {
    res.redirect('/login');
  });  
});

app.get('/login', (req, res) => {
  res.render('login');
  // if (doesUserExist) {
  //   res.render('index');
  // }
  // res.redirect('/signup');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  
  Users.create({
    username: username,
    password: password
  }).then((x) => {
    req.session.loggedIn = true;
    res.redirect('/');
  });
  
  //after making new user assign session and then redirect
  
  
});


app.get('/links', util.isLoggedOn, function(req, res) {
  //console.log('Getting link page');
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', function(req, res) {
  var uri = req.body.url;
  //console.log('Doing a post request');
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
// const isLoggedOn = (req, res, next) => {
  
// };



// var isAuthenticated = function(req, res, next) {
//   if (true) {
//     return next();
//   }
//   res.redirect('/views/login.ejs');
// };


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
