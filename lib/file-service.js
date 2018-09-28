const multiparty = require('multiparty');
const http = require('http');
const util = require('util');
const fs = require('fs');

const SERVICE_PORT = 3002;
const SERVICE_PATH = '/api/fileserviceupload';
const uploadDir = __dirname + '/../uploads';

const serviceHandler = (req, res) => {
  if (req.url === '/api/fileserviceupload' && req.method === 'POST') {
    const form = new multiparty.Form({
      uploadDir
    });

    form.parse(req, (err, fields, files) => {
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(JSON.stringify(files));
    });
  } else {
    res.writeHead(404);
    res.end('Invalid route');
  }
};

module.exports = {
  start() {
    http
      .createServer(serviceHandler)
      .listen(SERVICE_PORT, '0.0.0.0', () => {
        console.info('File service started, listening to port %s', SERVICE_PORT);
      });
  },

  url: SERVICE_PATH,
  port: SERVICE_PORT
};


