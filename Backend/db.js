const { initializeApp } = require('firebase/app')
const firebase = require('firebase/app')
const config = require('./config')


//const db = firebase.initializeApp(config.firebaseconfig);
const db = initializeApp(config.firebaseconfig);
module.exports = db