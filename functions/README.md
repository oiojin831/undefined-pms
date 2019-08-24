npm run build && firebase serve --only functions
npm run build && firebase emulators:start --only functions

curl -X POST -H "Content-Type: application/json" -d @expedia-new.json http://localhost:5000/airbnb-dmyk/us-central1/newExpedia

get a credetial
export GOOGLE_APPLICATION_CREDENTIALS="/Users/oiojin831/Developments/undefinedist/keys/airbnb-dmyk-493c11131564.json"
