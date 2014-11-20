var request = require('request');
var _ = require('lodash');
var geoip = require('geoip-lite');

/** 
 * Converts numeric degrees to radians
 */
if (typeof (Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function () {
    return this * Math.PI / 180;
  }
}

/**
 * Calculates the distance between two coordinates.
 * Uses the great circle calculation (haversine).
 * @param l1 origin coordinate in the form [lat, lon]
 * @param l2 destination coordinate in the form [lat, lon]
 * @return distance in kilometers
 */
function calcDistance (l1, l2) {
  // The earth's is a sphere, so use its radius (in IU units, like kilometers)
  var radius = 6371;
  // Calculate the raw distances between points
  // And convert to radians; no one uses degress in math
  var dist = [
    (l2[0] - l1[0]).toRad(),
    (l2[1] - l1[1]).toRad()
  ];
  // Use the haversine formula
  var a = Math.sin(dist[0]/2) * Math.sin(dist[0]/2) +
    Math.cos(l1[0].toRad()) * Math.cos(l2[0].toRad()) *
    Math.sin(dist[1]/2) * Math.sin(dist[1]/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = radius * c;
  // Return the distance in kilometers
  return d;
};

/**
 * Given an array of data, find data that matches
 * first_name and last_name
 * @param data array of input data
 * @param first_name first name string to match
 * @param last_name last name string to match
 * @return array of matching entries
 */
function findMatches (data, first_name, last_name) {
  // normalize first and last name
  var fn = first_name.toLowerCase().trim();
  var ln = last_name.toLowerCase().trim();
  var result = [];
  for (var i = 0; i < data.length; i++) {
    if ((data[i].first_name.toLowerCase().trim() == fn) &&
      (data[i].last_name.toLowerCase().trim() == ln)) {
      // match!
      result.push(data[i]);
    }
  }
  return result;
};

/**
 * Get the distance between someone with a
 * (name, IP) pair and a remote database.
 * param params the parameters array with IP and name
 * param cb callback function of the format (error_code, object)
 */
function getDistance (params, cb) {
  // Perform parameter validation
  if (_.isUndefined(params.ip)) {
    cb(422, { error: 'IP Address is required.'} );
    return;
  }
  if (_.isUndefined(params.first_name)) {
    cb(422, { error: 'First Name is required.'} );
    return;
  }
  if (_.isUndefined(params.last_name)) {
    cb(422, { error: 'Last Name is required.'} );
    return;
  }
  // Get the lat/long coordinates of the IP address
  var geo = geoip.lookup(params.ip);
  // Request the list of people from the remote server
  request({
    url: "http://private-5e0de-nodejsapitestprovider.apiary-mock.com/api/people",
    method: "GET",
    timeout: 20000
  }, function (error, response, body) {
    // success, parse results
    if (response.statusCode === 200) {
      // find responses that match the person specified
      var matches = findMatches(JSON.parse(body), params.first_name, params.last_name);
      // iterate through each of the entries and calculate the distance
      for (var i = 0; i < matches.length; i++) {
        matches[i].phone_distance_from_ip = calcDistance(
          [matches[i].phone_location.latitude, matches[i].phone_location.longitude],
          geo.ll
        );
        matches[i].stated_distance_from_ip = calcDistance(
          [matches[i].stated_location.latitude, matches[i].stated_location.longitude],
          geo.ll
        );
        matches[i].stated_distance_from_phone = calcDistance(
          [matches[i].stated_location.latitude, matches[i].stated_location.longitude],
          [matches[i].phone_location.latitude, matches[i].phone_location.longitude]
        );
      }
      // if only one match, just return object as per the spec
      // otherwise, return an array with all of the results
      if (matches.length === 1) {
        cb(null, matches[0]);
      } else {
        cb(null, matches);
      }
    }
    // error, respond to client with a corresponding error
    else {
      cb(500, { error: 'Remote server took too long to provide people.' });
    }
  });
};

module.exports = {
  calcDistance: calcDistance,
  findMatches: findMatches,
  getDistance: getDistance
};
