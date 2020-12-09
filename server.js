var express = require('express');
var app = express();
var path = require('path');
const port = 4000


// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public', 'images')));




const { AppConfigurationCore, UrlBuilder, Logger } = require('ibm-appconfiguration-node-core');
const { AppConfigurationFeature } = require('ibm-appconfiguration-node-feature');

// Enable logger
var appconfigLogger = Logger.getInstance()
appconfigLogger.setDebug(true)

// NOTE: Add your custom values
const coreClient = AppConfigurationCore.getInstance({
    region: 'eu-gb',
    guid: '123456',
    apikey: 'abcdef',
})


const featureClient = AppConfigurationFeature.getInstance({
    collectionId: 'blog-sample',
    liveFeatureUpdateEnabled: true
})

let flashSaleBanner;
let flashSaleDate;
let bluetoothEarphones;

function featureCheck(req, res, next) {
    req.headers["time"] = (Date.parse(new Date().toLocaleString()));

    const flashSaleBannerFeature = featureClient.getFeature('flash-sale-banner')
    flashSaleBanner = flashSaleBannerFeature.isEnabled()

    const flashSaleDateFeature = featureClient.getFeature('flash-sale-date')
    flashSaleDate = flashSaleDateFeature.getCurrentValue()

    const bluetootEarphonesFeature = featureClient.getFeature('bluetooth-earphones')
    bluetoothEarphones = bluetootEarphonesFeature.getCurrentValue(req)

    next()
}

app.get('/', featureCheck, function (req, res) {
    res.render('index.html', { flashSaleBanner: flashSaleBanner, flashSaleDate: flashSaleDate, bluetoothEarphones: bluetoothEarphones });
    console.log('banner', flashSaleBanner)
    console.log('date', flashSaleDate)
    console.log('bluetoothEarphones', bluetoothEarphones)
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})