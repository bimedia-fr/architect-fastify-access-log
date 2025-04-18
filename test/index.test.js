const assert = require('assert');
const setup = require('../lib/index');
const accesslog = require('../lib/access-logger');

describe('setup function', () => {
    let server, hooks = {}, loggerMock, originalAccessLog;

    beforeEach(() => {
        server = {
            addHook: (hookName, callback) => {
                hooks[hookName] = callback;
            },
            hasHook: (hookName) => {
                return !!hooks[hookName];
            },
            close: () => {
                // Simulate server close
            }
        };
        loggerMock = {
            getLogger: () => ({
                info: () => {},
                error: () => {}
            })
        };
        originalAccessLog = accesslog.log;
        accesslog.log = function () {};
    });

    afterEach(() => {
        accesslog.log = originalAccessLog;
        server.close();
    });

    it('should register hooks for onRequest and onResponse', (done) => {
        const options = { filters: [], name: 'test', level: 'info' };
        const imports = { rest: server, log: loggerMock };

        setup(options, imports, () => {
            assert.strictEqual(server.hasHook('onRequest'), true);
            assert.strictEqual(server.hasHook('onResponse'), true);
            done();
        });
    });

    it('should skip logging for filtered URLs', (done) => {
        const options = { filters: ['/api/health'], name: 'test', level: 'info' };
        const imports = { rest: server, log: loggerMock };

        let logCalled = false;
        accesslog.log = () => {
            logCalled = true;
        };

        setup(options, imports, () => {
            const req = { url: '/api/health' };
            hooks.onRequest(req, {}, () => {
                assert.strictEqual(logCalled, false);
                assert.ok(!req.afAccessLogStartTime);
                done();
            });
        });
    });
    it('should log for non filtered URLs', (done) => {
        const options = { filters: ['/api/health'], name: 'test', level: 'info' };
        const imports = { rest: server, log: loggerMock };

        let logCalled = false;
        accesslog.log = () => {
            logCalled = true;
        };

        setup(options, imports, () => {
            const req = { url: '/api/camoulox' };
            hooks.onRequest(req, {}, () => {
                assert.strictEqual(logCalled, false);
                assert.ok(req.afAccessLogStartTime);
                done();
            });
        });
    });
});

