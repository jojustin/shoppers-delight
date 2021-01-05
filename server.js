var express = require('express');
var app = express();
var path = require('path');
const port = 3000

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public', 'images')));

const { AppConfigurationCore, Logger } = require('ibm-appconfiguration-node-core');
const { AppConfigurationFeature } = require('ibm-appconfiguration-node-feature');

// Enable logger
var appconfigLogger = Logger.getInstance()
appconfigLogger.setDebug(true)

// NOTE: Add your custom values
const coreClient = AppConfigurationCore.getInstance({
    region: 'eu-gb',        //use `us-south` for Dallas. `eu-gb` for London
    guid: '123456',
    apikey: 'abcdef',
})

// Fetaure SDK init
const featureClient = AppConfigurationFeature.getInstance({
    collectionId: 'shopping-website',
    liveFeatureUpdateEnabled: true
})

let enableFlashSaleBanner;
let showFlashSaleDate;
let enableBluetoothEarphones;

function featureCheck(req, res, next) {
    req.headers["time"] = new Date().getHours();        //attaching the hours value to custom property called "time" to the request header

    // fetch the feature `flash-sale-banner` and obtain the isEnabled() value
    const flashSaleBannerFeature = featureClient.getFeature('flash-sale-banner')
    enableFlashSaleBanner = flashSaleBannerFeature.isEnabled()

    // fetch the feature `flash-sale-date` and obtain the getCurrentValue() value
    const flashSaleDateFeature = featureClient.getFeature('flash-sale-date')
    showFlashSaleDate = flashSaleDateFeature.getCurrentValue()

    /* fetch the feature `bluetooth-earphones` and obtain the getCurrentValue(req) along with feature evaluation via the req object.
    Here, getCurrentValue(req) will evaluate the "time" property from the request header and returns the value */
    const bluetootEarphonesFeature = featureClient.getFeature('bluetooth-earphones')
    enableBluetoothEarphones = bluetootEarphonesFeature.getCurrentValue(req)

    next()
}

app.get('/', featureCheck, function (req, res) {
    res.render('index.html', { flashSaleBanner: enableFlashSaleBanner, flashSaleDate: showFlashSaleDate, bluetoothEarphones: enableBluetoothEarphones });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})