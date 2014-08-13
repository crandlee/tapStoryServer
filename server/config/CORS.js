var restify = require('restify');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = global.rootRequire('cfg-config')[env];

module.exports = {

  //This module exists to help with pre-flight OPTIONS requests
  //that are currently returned with a 405 Unknown Method from restify
  //CORS handler does not seem to pick this up
  preflightHandler: function(req, res) {


        if (req.method.toLowerCase() == 'options') {

            var allowHeaders = ['authorization', 'accept', 'accept-version',
                'content-type', 'api-version'];

            if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');
            if (res.methods.indexOf('PUT') === -1) res.methods.push('PUT');
            if (res.methods.indexOf('DELETE') === -1) res.methods.push('DELETE');

            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
            res.header('Access-Control-Allow-Methods', res.methods.join(', '));
            res.header('Access-Control-Allow-Origin', config.allowedRemoteOrigins);

            return res.send(204);

        } else {

            return res.send(new restify.MethodNotAllowedError());

        }
  }
};