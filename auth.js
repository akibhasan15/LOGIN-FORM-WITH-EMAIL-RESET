const LocalStrategy =require('passport-local');
const passport=require('passport');
const bcrypt=require('bcryptjs');
const ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const session= require('express-session');
const { User } = require('./User');
     
// *!STORE SESSION ID FOR SESSION        
const MongoStore=require('connect-mongo')(session);

module.exports=function(app,db){

  app.use(
    session({
      secret: 'MySecret', //process.env.SESSION_SECRET,==this is for production
      resave: true,
      saveUninitialized: true,
      // *! THIS CONNECT TO DATABSE AND STORE SESSION ID
      store: new MongoStore({
        mongooseConnection: mongoose.connection
      })
    })
  )

  
  // app.use()
  //* mongoose.connection=db=mongoose.connection[0] //db.on(..) //db.once(..)
  app.use(passport.initialize())
  app.use(passport.session())

  // *!SERIALIZE AND DESIRIALIZE USER
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    db.collection('users').findOne(
      {
        _id: new ObjectID(id)
      },
      (err, doc) => {
        done(null, doc)
      }
    )
  })

  // *! PASSPORT STRATEGY LOCAL
  passport.use(
    new LocalStrategy(function(username, password, done) {
      User.findOne(
        {
          email: username 
        },
        function(err, user) {
          console.log('User ' + username + ' attempted to log in.')
          // console.log(`LOCAL ${user}`)
          if (err) {
            
            return done(err)
          }
          if (!user) {
            
            return done(null, false,{message:'no such user'})
          }
          // if (password !== user.password) { return done(null, false); }//** */!REPLACED BCOZ OF HASHING
          if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false)
          }
          return done(null, user)
        }
      )
    })
  )

}