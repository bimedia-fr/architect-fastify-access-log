const accesslog = require('./access-logger');

module.exports = function setup(options, imports, register) {
    var rest = imports.rest;
    var logger = imports.log;

    options.filters = options.filters || [];

    var log = logger.getLogger(options.name || 'http');
    const handler = log[options.level || 'info'].bind(log);
    const ops = {
        format : options.fmt || options.format
    };
    if (options.userID) {
        ops.userID = options.userID;
    }

    rest.addHook('onRequest', (req, res, next) => {
        let test = false;
        if(options.filters) {
            options.filters.some(function (r) {
                let reg = new RegExp('^' + r.replace('/', '\\/').replace('*', '.*') + '$');
                if(reg.test(req.url)) {
                    test = true;
                };
            });
        }

        if(test)
            return next();

        req.afAccessLogStartTime = new Date();
        next();
    });
    rest.addHook('onResponse', (req, res, next) => {
        if (options.filters.indexOf(req.url) > -1) {
            return next();
        }
        accesslog(req, res, ops, handler);
        next();
    });

    register();
};

module.exports.consumes = ['rest', 'log'];
