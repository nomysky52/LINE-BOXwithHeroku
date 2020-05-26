/*
 * imgur-upload
 * https://github.com/jamiees2/imgur-node-api/
 *
 * Copyright (c) 2013 jamiees2
 * Licensed under the MIT license.
 */
// imgur
// Client ID:
// fcbd8a365917116
//e6cd0f108cc2191
// Client secret:
// 4a133e1b1249f93130b4620e4aff3a5be0724d7d
//04901adaba308a3c8b8f93af1ef268d7d253add6
//token
//8b9bf5da010f978e77ae3813ea1c5113792d1e6a
//315360000
//bearer
//023e38dd31abbfeb1ba630be63c06b500c3c6fa8
//131372915
//carzy1314love

 'use strict';

var fs = require('fs');
var request = require('request');
var request = request.defaults({
  json: true
});

var imgur = {
  _clientID : null,
  setClientID : function(clientID){
    this._clientID = clientID;
  },
  upload: function(_file,_cb) {
    if(this._clientID && _file) {
      var options = {
        url: 'https://api.imgur.com/3/upload',
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        }
      };
      var post = request.post(options, function (err, req, body){
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });

      var upload = post.form();
      if (_file.match(/^https?:\/\//i)) {
        upload.append('type','url');
        upload.append('image',_file);
      } else {
        upload.append('type', 'file');
        upload.append('image', _file);
        //upload.append('image', fs.createReadStream(_file));
      }
    }
  },
  delete: function(_id, _cb) {
    if(this._clientID && _id) {
      var options = {
        url: 'https://api.imgur.com/3/image/' + _id,
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        }
      };
      request.del(options, function (err, req, body) {
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });
    }
  },
  update: function(_params, _cb) {
    if(this._clientID && _params.id && (_params.title || _params.description)) {
      var options = {
        url: 'https://api.imgur.com/3/image/' + _params.id,
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        },
        form: {
          title: _params.title ? _params.title : null,
          description: _params.description ? _params.description : null
        }
      };
      request.post(options, function (err, req, body) {
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });
    }
  },
  getCredits: function(_cb) {
    if(this._clientID) {
      var options = {
        url: 'https://api.imgur.com/3/credits',
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        }
      };
      request(options, function (err, req, body) {
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });
    }
  }
};

exports.setClientID = imgur.setClientID;
exports.upload = imgur.upload;
exports.update = imgur.update;
exports.delete = imgur.delete;
exports.getCredits = imgur.getCredits;