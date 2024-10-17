const strftime = require('strftime');

let defaultformat = ':ip - :userID [:clfDate] ":method :url :protocol/:httpVersion" :statusCode :contentLength ":referer" ":userAgent"';

module.exports = accesslog;

function accesslog(req, res, format, cb) {
    if (typeof format === 'function') {
        cb = format;
        format = null;
    }

    let remoteAddress = req.ip;
    let contentLength, options = {};
    if (typeof format === 'object') {
        options = format;
        format = options.format;
    }
    format = format || defaultformat;
    // eslint-disable-next-line no-console
    cb = cb || console.log.bind(console);

    let uriDecoded;
    try {
        uriDecoded = decodeURIComponent(req.url);
    } catch (e) {
        uriDecoded = e.message || 'error decoding URI';
    }

    contentLength = res.raw._contentLength;
    let start = req.afAccessLogStartTime;
    let end = new Date();
    let userID;
    try {
        userID = (options.userID || basiAuthUserID)(req);
    // eslint-disable-next-line no-unused-vars
    } catch (e)
    // eslint-disable-next-line no-empty
    {}

    let data = {
        ':clfDate': strftime('%d/%b/%Y:%H:%M:%S %z', end),
        ':contentLength': res.headers['content-length'] || contentLength || '-',
        ':delta': res.elapsedTime.toFixed(0),
        ':endDate': end.toISOString(),
        ':endTime': end.getTime(),
        ':host': encode(req.headers.host || '-'),
        ':httpVersion': req.raw.httpVersion,
        ':ip': remoteAddress || '-',
        ':Xip': encode(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || remoteAddress || '-'),
        ':method': req.method,
        ':protocol': req.protocol,
        ':referer': encode(req.headers.referer || '-'),
        ':startDate': start.toISOString(),
        ':startTime': start.getTime(),
        ':statusCode': res.statusCode,
        ':url': encode(req.url),
        ':urlDecoded': encode(uriDecoded),
        ':userID': encode(userID || '-'),
        ':userAgent': encode(req.headers['user-agent'] || '-')
    };

    cb(template(format, data));
}

function basiAuthUserID(req) {
    return Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':')[0];
}

// replace :variable and :{variable} in `s` with what's in `d`
function template(s, d) {
    s = s.replace(/(:[a-zA-Z]+)/g, function (match, key) {
        return d[key] || '';
    });
    return s.replace(/:{([a-zA-Z]+)}/g, function (match, key) {
        return d[':' + key] || '';
    });
}

// make a string safe to put in double quotes in CLF
function encode(s) {
    return s.replace(/\\/g, '\\x5C').replace(/"/, '\\x22');
}
