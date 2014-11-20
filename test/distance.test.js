var distance = require('../lib/distance');
var data = require('./config').matchData;
var assert = require('chai').assert;

describe('distance:', function () {
  // check the calcDistance function does the right thing
  it('calcDistance', function () {
    // distance between San Franciso and New York
    var d1 = distance.calcDistance([37.7799084, -122.4143136], [40.7505781, -73.9685495]);
    assert.equal(Math.ceil(d1), 4131);
  });

  describe('findMatches:', function () {
    // there shouldn't be any matches
    it('none', function () {
      var r = distance.findMatches(
        data,
        'Winston',
        'Churchill');
      assert.equal(r.length, 0);
      assert.isArray(r);
    });
    it('one', function () {
      var r = distance.findMatches(
        data,
        'alfred ',
        'hItchcock');
      assert.equal(r.length, 1);
      assert.equal(r[0].first_name, 'Alfred');
    });
    it('multiple', function () {
      var r = distance.findMatches(
        data,
        'john',
        'doe');
      assert.equal(r.length, 2);
      for (var i = 0; i < r.length; i++) {
        assert.equal(r[i].first_name, 'John');        
      }
    });
  });

});
