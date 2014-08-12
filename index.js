/**
 * @fileoverview Backplane auth delegate. Note the differences in implementation between 1.2 and 2.0
 * versions of Backplane.
 */
var bind = require('mout/function/bind');
var jsonp = require('backplane-auth-plugin/util/jsonp');

var BP_MSG_TYPES = {
    LOGIN: 'identity/login',
    LOGOUT: 'identity/logout'
};
var VERSIONS = {
    v12: /1\.2\.[0-9]/,
    v20: /2\.0\.[0-9]/
};

/**
 * Get first matching message in reverse order. This is necesary because the user could have
 * logged in and out multiple times. We desire the latest message.
 * @param  {Array.<Object>} messages
 * @return {?Object}
 */
function extractLastMessage(messages) {
    var message, type, i = messages.length;

    while (i--) {
        message = messages[i];
        type = message['type'] || (message['message'] || {})['type'];
        if (type === BP_MSG_TYPES.LOGIN || type === BP_MSG_TYPES.LOGOUT) {
            return message;
        }
    }
    return null;
}

/**
 * Backplane 1.2 logic.
 * See: https://sites.google.com/site/backplanespec/documentation/backplane1-2
 * Also: http://developers.janrain.com/documentation/backplane-protocol/addtoyourwebsite/legacy-backplane-1x/
 * Upon page load fetch existing Backplane message from the bus.
 * This is the case in which the user is currently logged in, but
 * has navigated to a new page.
 * Uses the channel if set on the Livefyre.user model.
 * @param {Backplane} backplane
 * @param {Function()} handleMessage
 */
function backendv12(backplane, handleMessage) {
    var bpChannel = window.Backplane.getChannelID() || null;

    function handler(message) {
        handleMessage(message);
    }

    backplane.subscribe(handler);
    jsonp.req(bpChannel, function(err, data) {
        if (err) {
            return;
        }
        if (!data.length) {
            return;
        }
        var message = extractLastMessage(data);
        message && handler(message['message']);
    });
}

/**
 * Backplane 2.0 logic.
 * See: http://developers.janrain.com/documentation/backplane-protocol/addtoyourapplication/backplane-2-0/
 * @param {Backplane} backplane
 * @param {Function()} handleMessage
 */
function backendv20(backplane, handleMessage) {
    function handler(message) {
        handleMessage(message);
    }

    backplane.subscribe(handler);
    // Replay historic messages - this is how we will be notified of
    // identity events during a page refresh/redirect.
    var cachedMessages = backplane.getCachedMessages();
    if (cachedMessages.length) {
        // Priority is given to (more) recent messages
        var message = extractLastMessage(cachedMessages);
        if (message) {
            handler(message);
        }
    }
}

/**
 * @param {Backplane} backplane
 * @param {Function()} handleMessage
 */
function setSubscriptionByVersion(backplane, handleMessage) {
    var version = backplane.version;
    if (VERSIONS.v12.test(version)) {
        return backendv12(backplane, handleMessage);
    } else if (VERSIONS.v20.test(version)) {
        return backendv20(backplane, handleMessage);
    }
    throw 'Backplane delegate is only compatible with version 1.2 and 2.0 of Backplane';
}

/**
 * @param {string} network
 */
function backplanePluginFactory(network) {
    if (!network) {
        throw 'missing network parameter';
    }
    /**
     * @param {Auth} auth
     */
    return function backplanePlugin(auth) {
        var bp = window.Backplane;
        if (!bp) {
            throw 'missing global backplane instance';
        }

        function callback() {
            setSubscriptionByVersion(bp, bind(handleBackplaneMessage, this, auth, network));
        }

        bp(callback);
    }
}

// function pollForChannelChange (backplane, currentBPChannel) {
//     var poller;
//     var self = this;
//     function poll(backplane, currentBPChannel) {
//         // A request to reset Backplane is handled asynchronoulsy via JSONP,
//         // so we need to poll until the Backplane channel is reset, i.e. not
//         // equal to the value we have stored on the class (and not falsy too).
//         var bpChannelId = backplane.getChannelID();
//         var isUpdated = bpChannelId && currentBPChannel !== bpChannelId;

//         window.clearInterval(poller);

//         if (isUpdated) {
//             handleBackplaneMessage({
//                 'type': BP_MSG_TYPES.LOGOUT
//             });
//             return  poll(backplane, bpChannelId);
//         }
//         poller = window.setInterval(bind(poll, this, backplane, currentBPChannel), 100);
//     }
//     poll(backplane, currentBPChannel);
// }

/**
 * Based on message type, takes a certain action.
 * @param {Object} message
 */
function handleBackplaneMessage (auth, network, message) {
    var messageType = message['type'];
    switch (messageType) {
        case BP_MSG_TYPES.LOGIN:
            // if there is already a user then don't authenticate again
            if (auth.get('livefyre')) {
                return;
            }
            auth.authenticate({
                livefyre: {
                    bpChannel: message['channel'] ||  window.Backplane.getChannelID(),
                    network: network
                }
            });
            break;
        case BP_MSG_TYPES.LOGOUT:
            auth.emit('logout');
            break;
        default:
            throw 'This Backplane message type is not supported: ' + messageType;
    }
}

module.exports = backplanePluginFactory;
