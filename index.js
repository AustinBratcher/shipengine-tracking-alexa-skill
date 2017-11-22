'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'shipengine-tracking';  // TODO replace with your app ID (OPTIONAL).

const handlers = {

};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    
    alexa.registerHandlers(handlers);
    alexa.execute();
};

