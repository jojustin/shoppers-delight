require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const users = require('./public/users/users.json')
const { AppConfiguration } = require('ibm-appconfiguration-node-sdk'); // App Configuration SDK require

const app = express();
const port = 3000;
let userDetails = {};

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(session({ secret: 'work hard', saveUninitialized: true, resave: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public', 'users')));

// NOTE: Add your custom values
const region = process.env.REGION; // use `us-south` for Dallas. `eu-gb` for London. au-syd for Sydney
const guid = process.env.GUID;
const apikey = process.env.APIKEY;
const collectionId = process.env.COLLECTION_ID
const environmentId = process.env.ENVIRONMENT_ID

// App Configuration SDK initialisation
const client = AppConfiguration.getInstance();
// client.setDebug(true); // enable debug
client.init(region, guid, apikey);
client.setContext(collectionId, environmentId);

// for featureflags
let flashSaleBanner;
let bluetoothEarphones;
let primeItems;

function loginCheck(req, res, next) {
  if (req.session && req.session.userEmail) {
    req.isLoggedInUser = true
    userDetails = users.data.filter((e) => e.email === req.session.userEmail)[0]
  } else {
    req.isLoggedInUser = false
  }
  next()
}
function configCheck(req, res, next) {

  const bluetootEarphonesFeature = client.getFeature('bluetooth-earphones');
  bluetoothEarphones = bluetootEarphonesFeature.isEnabled();

  const flashSaleBannerFeature = client.getFeature('flashsale-banner');
  flashSaleBanner = flashSaleBannerFeature.isEnabled();

  const entityId = userDetails.email ? userDetails.email : 'defaultUser';
  const entityAttributesForPrimeItems = {
    is_prime: userDetails.is_prime
  };
  const primeItemsFeature = client.getFeature('exclusive-offers-section');
  primeItems = primeItemsFeature.getCurrentValue(entityId, entityAttributesForPrimeItems)

  next();
}

app.get('/', [loginCheck, configCheck], (req, res) => {
  res.render('index.html', { isLoggedInUser: req.isLoggedInUser, userEmail: req.session.userEmail, flashSaleBanner, bluetoothEarphones, primeItems });
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
