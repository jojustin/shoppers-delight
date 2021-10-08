require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const { AppConfiguration } = require('ibm-appconfiguration-node-sdk'); // App Configuration SDK require

const app = express();
const port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(session({ secret: 'work hard', saveUninitialized: true, resave: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public', 'images')));

// NOTE: Add your custom values
const region = process.env.REGION; // use `us-south` for Dallas. `eu-gb` for London. au-syd for Sydney
const guid = process.env.GUID;
const apikey = process.env.APIKEY;
const collectionId = process.env.COLLECTION_ID
const environmentId = process.env.ENVIRONMENT_ID

// App Configuration SDK initialisation
const client = AppConfiguration.getInstance();
client.setDebug(true); // enable debug
client.init(region, guid, apikey);
client.setContext(collectionId, environmentId);

// for property
let flashSaleDate;

// for featureflags
let flashSaleBanner;
let bluetoothEarphones;
let primeItems;

function configCheck(req, res, next) {
  if (req.session && req.session.userEmail) {
    req.isLoggedInUser = true
  } else {
    req.isLoggedInUser = false
  }
  next();

  const entityId = 'defaultUser';
  const entityAttributesForEarphones = {
    time: new Date().getHours(),
  };
  const entityAttributesForPrimeItems = {
    email: req.session.userEmail ? req.session.userEmail : 'defaultUser',
  };

  console.log("Current local hours is", entityAttributesForEarphones.time)

  // fetch the property details of propertyId `flash-sale-date` and obtain the property value using getCurrentValue()
  const flashSaleDateProperty = client.getProperty('flash-sale-date');
  flashSaleDate = flashSaleDateProperty.getCurrentValue(entityId, {});

  // fetch the feature details for featureId `flash-sale-banner` and obtain the feature value using getCurrentValue()
  const flashSaleBannerFeature = client.getFeature('flash-sale-banner');
  flashSaleBanner = flashSaleBannerFeature.getCurrentValue(entityId, {});

  // fetch the feature details of featureId `bluetooth-earphones` and obtain the feature evaluated value using getCurrentValue()
  const bluetootEarphonesFeature = client.getFeature('bluetooth-earphones');
  bluetoothEarphones = bluetootEarphonesFeature.getCurrentValue(entityId, entityAttributesForEarphones);

  const primeItemsFeature = client.getFeature('exclusive-offers');
  primeItems = primeItemsFeature.getCurrentValue(entityId, entityAttributesForPrimeItems)

  next();
}

app.get('/', configCheck, (req, res) => {
  res.render('index.html', { isLoggedInUser: req.isLoggedInUser, userEmail: req.session.userEmail, flashSaleBanner, flashSaleDate, bluetoothEarphones, primeItems });
});

app.post('/', (req, res, next) => {
  if (req.body.logemail && req.body.logpassword) {
    req.session.userEmail = req.body.logemail;
    return res.redirect('/');
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

app.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  }
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).send('<h2>Error</h2>' + err)
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
