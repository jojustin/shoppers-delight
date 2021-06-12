const express = require('express');

const app = express();
const path = require('path');

const port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public', 'images')));

// App Configuration SDK require
const { AppConfiguration } = require('ibm-appconfiguration-node-sdk');

// NOTE: Add your custom values
const region = 'region'; // use `us-south` for Dallas. `eu-gb` for London. au-syd for Sydney
const guid = 'guid';
const apikey = 'apikey';

const client = AppConfiguration.getInstance();

// App Configuration SDK initialisation
client.setDebug(true); // enable debug
client.init(region, guid, apikey);
client.setContext('shopping-website', 'dev');

// property
let flashSaleDate;

// featureflags
let flashSaleBanner;
let bluetoothEarphones;

function configCheck(req, res, next) {
  const entityId = 'defaultUser';
  const entityAttributes = {
    time: new Date().getHours(),
  };

  console.log("Current local hours is", entityAttributes.time)

  // fetch the property details of propertyId `flash-sale-date` and obtain the property value using getCurrentValue()
  const flashSaleDateProperty = client.getProperty('flash-sale-date');
  flashSaleDate = flashSaleDateProperty.getCurrentValue(entityId, {});

  // fetch the feature details for featureId `flash-sale-banner` and obtain the feature value using getCurrentValue()
  const flashSaleBannerFeature = client.getFeature('flash-sale-banner');
  flashSaleBanner = flashSaleBannerFeature.getCurrentValue(entityId, {});

  // fetch the feature details of featureId `bluetooth-earphones` and obtain the feature evaluated value using getCurrentValue()
  const bluetootEarphonesFeature = client.getFeature('bluetooth-earphones');
  bluetoothEarphones = bluetootEarphonesFeature.getCurrentValue(entityId, entityAttributes);

  next();
}

app.get('/', configCheck, (req, res) => {
  res.render('index.html', { flashSaleBanner, flashSaleDate, bluetoothEarphones });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
