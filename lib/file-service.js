const multiparty = require('multiparty');
const http = require('http');
const util = require('util');
const fs = require('fs');

const FILE_SERVICE_PORT = 3002;
const SERVICE_PATH = '/api/fileserviceupload';

const serviceHandler = (req, res) => {
  if (req.url === '/api/fileserviceupload' && req.method === 'POST') {
    const form = new multiparty.Form({
      uploadDir: __dirname + '/../uploads'
    });

    form.parse(req, (err, fields, files) => {
      res.writeHead(200, {'content-type': 'application/json'});
      res.end(util.inspect(files));
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
      .listen(FILE_SERVICE_PORT, '0.0.0.0', () => {
        console.info('File service started, listening to port %s', FILE_SERVICE_PORT);
      });
  },

  url: SERVICE_PATH,
  port: FILE_SERVICE_PORT
};


