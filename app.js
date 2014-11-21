var restify = require('restify');
var _ = require('lodash');
var distance = require('./lib/distance');

/**
 * API handler for the distance API,
 * which takes a name and IP, compares it against
 * a list of tracked names, and computes the
 * distances between points.
 */
var getDistance = function (req, res, next) {
  distance.getDistance(req.params, function (error_code, data) {
    if (_.isNull(error_code)) {
      res.send(data);
    } else {
      res.send(error_code, data);      
    }
    next();
  });
};

// set up the server
var server = restify.createServer();
// put query values in the params
server.use(restify.queryParser());
// put json body values into the params
server.use(restify.bodyParser());
// register the api endpoing
server.get('/api/distance', getDistance);
server.post('/api/distance', getDistance);

// startup the server
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
