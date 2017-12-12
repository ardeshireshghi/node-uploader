const qs = require('querystring');

const handlers = {
  http: require('http'),
  https: require('https')
};

class HttpHandler {
  constructor(params) {
    params = params || {};
    this.host = params.host;
    this.handler = handlers[this.host.protocol];
    this.agent = this.makeAgent(params.agentConfig);
  }

  makeReqParams(params) {
    params = params || {};
    const host = this.host;

    const reqParams = {
      method: params.method || 'GET',
      protocol: host.protocol + ':',
      hostname: host.host,
      port: host.port,
      path: (host.path || '') + (params.path || ''),
      headers: params.headers,
      agent: this.agent
    };

    if (!reqParams.path) {
      reqParams.path = '/';
    }

    if (params.query) {
      reqParams.path += `?${qs.stringify(params.query)}`;
    }

    return reqParams;
  }

  makeAgent(params = {}) {
    const agentParams = {
      keepAlive: true,
      maxSockets: 30,
      minSockets: 30,
      ...params
    };

    return new this.handler.Agent(agentParams);
  }

  request(params, cb) {
    let reqParams = this.makeReqParams(params),
      request,
      response,
      responseBody = '';

    const handleError = (err) => {
      request && request.removeAllListeners();
      response && response.removeAllListeners();
      if (err) {
        return cb(err);
      } else {
        cb(new Error('There was an error queries ES host'));
      }
    };

    const handleSuccess = (err) => {
      request && request.removeAllListeners();
      response && response.removeAllListeners();
      cb(null, responseBody, response.statusCode, response.headers);
    };

    request = this.handler.request(reqParams, (res) => {
      response = res;
      const status = response.statusCode;
      const headers = response.headers;

      response.setEncoding('utf8');
      response.on('data', (d) => {
        responseBody += d;
      });

      response.on('error', handleError);
      response.on('end', handleSuccess);
    });

    request.on('error', handleError);

    request.setNoDelay(true);
    request.setSocketKeepAlive(true);

    if (params.body) {
      request.setHeader('Content-Length', Buffer.byteLength(params.body, 'utf8'));
      request.write(params.body);
    }

    return request;
  }

  static get states() {
    return {
      '400':  'Bad Request',
      '401':  'Authentication Exception',
      '402':  'Payment Required',
      '403': 'Authorization Exception',
      '404': 'Not Found',
      '405': 'Method Not Allowed',
      '406': 'Not Acceptable',
      '407': 'Proxy Authentication Required',
      '408': 'Request Timeout',
      '409': 'Conflict',
      '410': 'Gone',
      '411': 'Length Required',
      '500': 'Internal Server Error',
      '501': 'Not Implemented',
      '502': 'Bad Gateway',
      '503': 'Service Unavailable',
      '504': 'Gateway Timeout'
    };
  }
}

module.exports = {
  HttpHandler
};
