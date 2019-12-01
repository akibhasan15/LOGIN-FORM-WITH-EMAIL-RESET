'use strict'
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const async =require('async');
const crypto = require('crypto');
const cookieParser=require('cookie-parser');
const nodemailer=require('nodemailer');
const flash = require('connect-flash');


// const ObjectID = require('mongodb').ObjectID

// const mongo    = require('mongodb').MongoClient;


//*! REQUIRING THE AUTHENTICATION AND ROUTE FILES

const routes   =require('./routes');

const auth =require('./auth');

const { User } = require('./User')

const sendgridReset=require('./sengridReset');

const app = express();


  //*! SET ENGINE(PUG)
  app.set('view engine', 'pug');
  app.use(flash()); //! USING EXPRESS-FLASH
  app.use(cookieParser());
 
// *!STORE SESSION ID FOR SESSION
const MongoStore = require('connect-mongo')(session)
app.use('/public', express.static(process.cwd() + '/public'))
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

//*!DATABASE CONNECTION
mongoose.connect( 
  process.env.MONGODB_CREDENTIALS, 
  {
    useNewUrlParser: true
  },
  err => {
    if (err) {
      console.log('Database error: ' + err)
    } else {
      console.log('Successful database connection')

      // var db = client.db('login');//*! VERY MUCH IMPORTANT FOR MONGO 3.X.X
    
      
      var db = mongoose.connection
      
      // *!AUTHENTICATION
      auth(app,db);
      //*! ROUTE IMPORTED 
      routes(app,db);
      //*! SENDGRIDREST ROUTE IMPORTED 
       sendgridReset(app,db)
      
       
      // *!HANDLING MISSING PAGES (404)
      app.use((req, res, next) => {
        res
          .status(404)
          .type('text')
          .send('Not Found')
      })
     //*! LETS TURN ON THE SERVER
      var port = process.env.PORT||3000
      app.listen(port, () => {
        console.log('Listening on port ' + port)
      })
    }
  }
)
