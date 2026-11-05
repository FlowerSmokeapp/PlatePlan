/*
  SETTINGS – fill these in to connect the app to its server.

  FIREBASE_CONFIG
    From the Firebase console: Project settings → General → Your apps → the web app (</>) → "SDK setup and
    configuration" → Config. Paste the values below. These values are meant to be public: the data is
    protected by firestore.rules.
    Empty apiKey = demo mode: accounts and Premium only live on this device, and offers are examples.

  FIREBASE_REGION
    Where the server functions run. Must match setGlobalOptions in functions/index.js.

  GOATCOUNTER_CODE
    Optional privacy-friendly analytics without cookies (https://www.goatcounter.com).
    Empty = no analytics.

  PREMIUM_PRICES
    Shown on the Premium screen.
*/
const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
const FIREBASE_REGION = "europe-west1";
const GOATCOUNTER_CODE = "";
const PREMIUM_PRICES = { monthly: 45, yearly: 299, trialDays: 7 };
