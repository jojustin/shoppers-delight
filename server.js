var express = require('express');
var app = express();
var path = require('path');
const port = 3000

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public', 'images')));

// App Configuration SDK require & init
const { AppConfiguration } = require('ibm-appconfiguration-node-sdk');

// NOTE: Add your custom values
let region = 'eu-gb';          //use `us-south` for Dallas. `eu-gb` for London
let guid = 'abc-def-xyz';
let apikey = 'j9qc-abc-z79';

const client = AppConfiguration.getInstance();

client.setDebug(true)             //enable debug
client.init(region, guid, apikey)
client.setCollectionId('shopping-website')

let enableFlashSaleBanner;
let showFlashSaleDate;
let enableBluetoothEarphones;

function featureCheck(req, res, next) {
    let identityId = "defaultUser";
    let identityAttributes = {
        'time': new Date().getHours()
    }

    // fetch the feature details for feature `flash-sale-banner` and obtain the enabled value isEnabled() method
    const flashSaleBannerFeature = client.getFeature('flash-sale-banner')
    enableFlashSaleBanner = flashSaleBannerFeature.isEnabled()

    // fetch the feature details of featureId `flash-sale-date` and obtain the enabled value using isEnabled() method
    const flashSaleDateFeature = client.getFeature('flash-sale-date')
    showFlashSaleDate = flashSaleDateFeature.getCurrentValue(identityId, identityAttributes)

    // fetch the feature details of featureId `bluetooth-earphones` and obtain the getCurrentValue(identity, identityAttributes) of the feature
    const bluetootEarphonesFeature = client.getFeature('bluetooth-earphones')
    enableBluetoothEarphones = bluetootEarphonesFeature.getCurrentValue(identityId, identityAttributes)

    next()
}

app.get('/', featureCheck, function (req, res) {
    res.render('index.html', { flashSaleBanner: enableFlashSaleBanner, flashSaleDate: showFlashSaleDate, bluetoothEarphones: enableBluetoothEarphones });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})