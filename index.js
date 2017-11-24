'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = 'shipengine-tracking';  

var ShipEngine = require('shipengine'); 
var shipEngine = new ShipEngine.ShipEngine(process.env.API_KEY);  

const CARRIER_PROMPT = "What shipping provider would you like to track a package for";
const TRACKING_PROMPT = "What is your tracking number"

function generateTrackingStatement(data) {
    var temp = `${data.tracking_number} is ${data.status_description}`;
}

const handlers = {
    "CarrierIntent": function() {
        // get tracking number
        var trackingNum = this.attributes['trackingNum']; 
        if(!trackingNum && this.event.request.intent.slots.trackingNumber) {
            // see if tracking num is in a slot
            truckingNum = this.events.request.intent.slots.trackingNumber.value; 
        }
        
        // get carrier
        var original = this.event.request.intent.slots.carrierName.value.split(' ').join('');
        var carrier = original.replace('.', '_'); 
        
        
        if(!shipEngine.validTrackingCarrier(carrier)) {
            this.response.speak(`Sorry, but we are currently unable to provide tracking information for packages delieverd by ${original}`); 
            this.emit(':responseReady'); 
        }
        else {
            this.attributes['carrier'] = carrier;
           
            if(!trackingNum) {
                this.response.speak(`Great. ${TRACKING_PROMPT} for ${original}?`)
                    .listen(`Sorry, I didn't hear that. ${TRACKING_PROMPT} for ${original}?`);
                this.emit(':responseReady');
            }
            else {
               // We have both!
                shipEngine.trackPackage(carrier, trackingNum).then((data)=>{
                    this.response.speak(genereateTrackingStatement(data)); 
                    this.emit(':responseReady'); 
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    },
    "TrackIntent" : function() {
        // get carrier 
        var carrier = this.attributes['carrier'];
        if(!carrier && this.event.request.intent.slots.carrierName) {
            // see if carrier is in slot
            var original = this.event.request.intent.slots.carrierName.value.split(' ').join('');
            carrier = original.replace('.', '_'); 
        } 

        // TOOD come up with way to validate tracking number
        // TODO consider confirming tracking number with user
        // get tracking number
        var trackingNum = this.event.request.intent.slots.trackingNumber.value.split(' ').join(''); 
        this.attributes['trackingNum'] = trackingNum; 
        
        if(!carrier) {
            // We have a tracking number, but not a carrier
            this.response.speak(`Great. ${CARRIER_PROMPT}?`);
            this.emit(':responseReady');
        }
        else {
            // we have both! query! 
            if(!shipEngine.validTrackingCarrier(carrier)) {
                this.response.speak(`Sorry, but we are currently unable to provide tracking information for packages delieverd by ${original}`); 
                this.emit(':responseReady'); 
            }
            else {
                shipEngine.trackPackage(carrier, trackingNum).then((data)=>{
                    this.response.speak(genereateTrackingStatement(data)); 
                    this.emit(':responseReady'); 
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    },
    "LaunchRequest" : function() {
        this.response.speak(`Welcome to Ship Engine Tracking. ${CARRIER_PROMPT}?`)
            .listen(`I'm sorry, I didn't hear you. ${CARRIER_PROMPT}?`); 
        this.emit(':responseReady'); 
    }

};

exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    
    alexa.registerHandlers(handlers);
    alexa.execute();
};
