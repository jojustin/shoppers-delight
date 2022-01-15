/*
 * (C) Copyright IBM Corp. 2021.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
var bunyan = require('bunyan');
const { AppConfiguration } = require('ibm-appconfiguration-node-sdk'); // App Configuration SDK require
const users = require('./public/users/users.json');

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

var log = bunyan.createLogger({name: "shoppersdelight"});
log.level("info");

// NOTE: Add your custom values
const region = process.env.REGION; // use `us-south` for Dallas. `eu-gb` for London. au-syd for Sydney
const guid = process.env.GUID;
const apikey = process.env.APIKEY;
const collectionId = process.env.COLLECTION_ID;
const environmentId = process.env.ENVIRONMENT_ID;

// App Configuration SDK initialisation
const client = AppConfiguration.getInstance();
// client.setDebug(true); // enable debug
client.init(region, guid, apikey);
client.setContext(collectionId, environmentId);


client.emitter.on('configurationUpdate', () => {
  acLogLevelFeature = client.getFeature('log-level');
  const logEntityId="appadminuser";
  acLogDebugLevel = acLogLevelFeature.getCurrentValue(logEntityId);
  log.level(acLogDebugLevel);
  log.info("application log level is " + acLogDebugLevel);
});



// for featureflags
let flashSaleBanner;
let bluetoothEarphones;
let primeItems;

function loginCheck(req, res, next) {
  if (req.session && req.session.userEmail) {
    req.isLoggedInUser = true;
    userDetails = users.data.filter((e) => e.email === req.session.userEmail)[0];
    const entityAttributesForLogs = {
      userid: userDetails.email,
    };
    acLogDebugLevel = acLogLevelFeature.getCurrentValue(userDetails.email, entityAttributesForLogs );
    console.log("application log level for user " + userDetails.email + " is " + acLogDebugLevel);
    log.level(acLogDebugLevel);
  } else {
    req.isLoggedInUser = false;
    userDetails = {}
  }
  next();
}
function configCheck(req, res, next) {
  const bluetootEarphonesFeature = client.getFeature('bluetooth-earphones');
  bluetoothEarphones = bluetootEarphonesFeature.isEnabled();
  log.debug("Bluetooth ear phones selling is enabled? " + bluetoothEarphones);

  const flashSaleBannerFeature = client.getFeature('flashsale-banner');
  flashSaleBanner = flashSaleBannerFeature.isEnabled();
  log.debug("Flash sale enabled? " + bluetoothEarphones);

  const entityId = userDetails.email ? userDetails.email : 'defaultUser';
  const entityAttributesForPrimeItems = {
    is_prime: userDetails.is_prime,
  };
  const primeItemsFeature = client.getFeature('exclusive-offers-section');
  primeItems = primeItemsFeature.getCurrentValue(entityId, entityAttributesForPrimeItems);
  log.debug("prime items details " + primeItems);

  next();
}

app.get('/', [loginCheck, configCheck], (req, res) => {
  res.render('index.html', {
    isLoggedInUser: req.isLoggedInUser,
    userEmail: req.session.userEmail,
    flashSaleBanner,
    bluetoothEarphones,
    primeItems,
  });
});

app.post('/', (req, res, next) => {
  if (req.body.logemail && req.body.logpassword) {
    req.session.userEmail = req.body.logemail;
    log.debug("user of the session is " + req.session.userEmail);
    return res.redirect('/');
  }
  const err = new Error('All fields required.');
  err.status = 400;
  return next(err);
});

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
  res.status(err.status || 500).send(`<h2>Error</h2>${err}`);
});

app.listen(port, () => {
  log.debug("Example app listening at http://localhost:${port}");
});
