// 1Z37V1V60301364248   

'use strict';
const Alexa = require('alexa-sdk');
const APP_ID = 'shipengine-tracking';  

var ShipEngine = require('shipengine'); 
var shipEngine = new ShipEngine.ShipEngine(process.env.API_KEY);  

const CARRIER_PROMPT = "What shipping provider would you like to track a package for";
const TRACKING_PROMPT = "What is your tracking number"

function generateTrackingStatement(data) {
    // var verb = data.status_code == "DE" ? "was" : "is"; 

    var temp = `${data.carrier_status_description}`;
}

const handlers = {
    "LaunchRequest" : function() {
        console.log('Track Intent Requested'); 

        this.response.speak(`Welcome to Ship Station. What would you like to do?`)ß
            .listen(`I'm sorry, I didn't hear you. What would you like to do?`); 
        this.emit(':responseReady'); 
    }, 
    "TrackIntent" : function() {

        console.log('Track Intent Requested'); 
        console.log(this.event.request);
        console.log(this.event.request.intent.slots);
        console.log(this.event.request.dialogState); 
        Object.keys(this.event.request.intent.slots).forEach((slot) =>{
            console.log(this.event.request.intent.slots[slot]); 
        });

        if(this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            console.log('Dialog incomplete'); 
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        }
        else {
            console.log('Dialog completed'); 
            // get carrier and tracking Num
            var originalCarrier = this.event.request.intent.slots.carrierName.value.split(' ').join('');
            var carrier = originalCarrier.replace('.', '_');

            // TOOD come up with way to validate tracking number
            // TODO consider confirming tracking number with user
            var trackingNum = this.event.request.intent.slots.trackingNumber.value.split(' ').join('');

            // we have both! query! 
            if(!shipEngine.validTrackingCarrier(carrier)) {
                this.response.speak(`Sorry, but we are currently unable to provide tracking information for packages delieverd by ${originalCarrier}`); 
                this.emit(':responseReady'); 
            }
            else {
                shipEngine.trackPackage(carrier, trackingNum).then((data)=>{
                    console.log(data);
                    if(data.status_code == "UN") {
                        this.response.speak(`Sorry, but we were unable to gather tracking information for the ${originalCarrier} tracking number ${trackingNum}`); 
                    } 
                    else this.response.speak(generateTrackingStatement(data)); 
                    this.emit(':responseReady'); 
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = "Help Intent";
        const reprompt = "Help Reprompt";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("Cancel Intent");
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("Stop Intent");
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log('Session Ended Request'); 
        console.log(this.event.request);
        console.log(this.event.request.intent.slots);
        console.log(this.event.request.dialogState); 
        Object.keys(this.event.request.intent.slots).forEach((slot) =>{
            console.log(this.event.request.intent.slots[slot]); 
        });

        this.response.speak("Session Ended");
        this.emit(':responseReady');
    }

};

exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    
    alexa.registerHandlers(handlers);
    alexa.execute();
};
