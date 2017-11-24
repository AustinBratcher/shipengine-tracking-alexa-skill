cd ~/Development/Projects/shipengine-tracking-alexa-skill && rm ./shipengine.zip
zip -r shipengine.zip ./index.js ./package.json ./node_modules
aws lambda update-function-code --function-name ShipEngine-Tracking --zip-file fileb://~/Development/Projects/shipengine-tracking-alexa-skill/shipengine.zip