var vows = require('vows');
var assert = require('assert');
var util = require('util');
var thecity = require('passport-thecity');


vows.describe('passport-thecity').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(thecity.version);
    },
  },
  
}).export(module);