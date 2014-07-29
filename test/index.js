var tap = require('tap');
var test = tap.test;
var requirejs = require('requirejs');
requirejs.config({
    baseUrl: '../',
    nodeRequire: require,
    paths: {
        base64: 'amd/base64',
        md5: 'amd/md5',
        base64: 'amd/base64/base64',
        'event-emitter': 'amd/event-emitter/src/event-emitter',
        inherits: 'amd/inherits/inherits',
        debug: 'amd/debug/debug',
        mout: 'amd/mout/src',
    },
    packages: [{
        name: 'auth',
        location: 'amd/auth/src'
    },{
        name: 'livefyre-auth',
        location: 'amd/livefyre-auth/src'
    },{
        name: 'backplane-auth-handler',
        location: 'amd',
        main: 'index'
    }]
});

global.window = {};
global.navigator = {
    userAgent: ''
};
global.document = {
    cookie: ''
};

window.Backplane = function() {};
window.Backplane.version = "2.0.6";

var bpHandler = requirejs('backplane-auth-handler');

test('\n is a function', function(t) {
    t.ok(typeof bpHandler === 'function');
    t.end();
});
