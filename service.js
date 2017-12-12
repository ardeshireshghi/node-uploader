const multiparty = require('multiparty');
const http = require('http');
const util = require('util');
const fs = require('fs');
const FormData =require('form-data');
const { HttpHandler } = require('./lib/transport');
const fileService = require('./lib/file-service');
const SERVICE_PORT = 3001;
const SERVICE_PATH = '/api/upload';
const { url: fileServiceBaseUrl, port: fileServicePort } = fileService;

const httpHandler = new HttpHandler({
  host: {
    host: 'localhost',
    port: fileServicePort,
    protocol: 'http'
  }
});

const serviceHandler = (req, res) => {
  if (req.url === SERVICE_PATH && req.method === 'POST') {
    const form = new multiparty.Form();

    form.on('file', (name, file) => {
      const formData = new FormData();
      const handleResponse = (err, httpRes) => {
        if (err) {
          console.log('Error posting file to file service', err.message);
          res.writeHead(200, {'content-type': 'application/json'});
          return res.end(JSON.stringify({error: true}));
        }

        console.log('Success posting file to the service', httpRes);
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({success: true}));
      };

      const headers = {
        'Authorization': 'Bearer sometoken',
        ...formData.getHeaders()
      };

      // Create request
      const httpReq = httpHandler.request({
        method: 'POST',
        path: fileServiceBaseUrl,
        headers
      }, handleResponse);

      formData.append(name, fs.createReadStream(file.path));
      formData.pipe(httpReq);
    });

    form.parse(req);
    return;
  }

  // Any other path
  res.writeHead(404);
  res.end('Invalid route');
};

http
  .createServer(serviceHandler)
  .listen(SERVICE_PORT, '0.0.0.0', () => {
    console.info('Uploader service started, listening to port %s', SERVICE_PORT);
  });

fileService.start();
