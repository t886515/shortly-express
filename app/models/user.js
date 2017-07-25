var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');




var User = db.Model.extend({
  tableName: 'users',
  initialize: function() {
    this.on('creating', (model, attrs, options) => {
      //model.set('username', username);
      bcrypt.hash(model.get('password'), null, null, function(err, hash) {
        console.log(hash);
        model.set('password', hash);
        console.log(model.password, 'is this set correctly?');
      });
      // var passHash = crypto.createHash('sha1');
      // passHash.update(model.get('password'));
      // model.set('password', passHash.digest('hex').slice(0, 5));
    });
  }
});

  // password: 'mama',
  // initialize: () => {
  //   this.on('creating', (model, attrs, options) => {
  //     var idontevenknow = bcrypt.creatHash('userHash');
  //     idontevenknow.update(model.get())
  //   })
  // }
module.exports = User;

// tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   clicks: function() {
//     return this.hasMany(Click);
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }