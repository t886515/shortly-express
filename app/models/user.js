var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');




var User = db.Model.extend({
  tableName: 'users',
  initialize: function() {
    this.on('creating', (model, attrs, options) => {
      //model.set('username', username);
      return new Promise((resolve, reject) => {
        bcrypt.hash(model.get('password'), null, null, function(err, hash) {
          console.log(hash, '---------------------------------');
          if (err) {
            reject(err);
          } else {
            model.set('password', hash);  
            resolve(hash);
          }
        });
      });
      // .then((result)=> {
      //   console.log(result);
      //   model.set('password', result);  
      // });

    });
  }
});

module.exports = User;
