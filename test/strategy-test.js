var vows = require('vows');
var assert = require('assert');
var util = require('util');
var theCityStrategy = require('passport-thecity/strategy');


vows.describe('theCityStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new theCityStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named theCity': function (strategy) {
      assert.equal(strategy.name, 'thecity');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new theCityStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2._request = function(method, url, headers, postData, accessToken, callback) {
        var body = '{ \
            "global_user": \
                { \
                  "id":1234567890, \
                  "first":"Firstname", \
                  "last":"Lastname", \
                  "email":"name@mail.net", \
                  "gender":"Male", \
                  "birthdate":"1990-03-24" \
                } \
          }';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'thecity');
        assert.equal(profile.id, '1234567890');
        assert.equal(profile._json.global_user.first, 'Firstname');
        assert.equal(profile._json.global_user.last, 'Lastname');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new theCityStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2._request = function(method, url, headers, postData, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);