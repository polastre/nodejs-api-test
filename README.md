nodejs-api-test [![Build Status](https://travis-ci.org/polastre/nodejs-api-test.svg?branch=master)](https://travis-ci.org/polastre/nodejs-api-test)
===============

A sample API server using Node.js.

This API application calculates the distance between points, assuming there's an external provider of names and coordinates.  It uses an [Apiary Mock Server](http://docs.nodejsapitestprovider.apiary.io/) to simulate the external provider.

To run, simply do:

```js
node app.js
```

To run the tests, it is just:

```js
npm test
```
