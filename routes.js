const passport = require('passport');
const bcrypt = require('bcryptjs');
const { User } = require('./User')


module.exports=function(app,db){
    // *!ROUTES

      // *! ENSURE AUTHENTICATION READ BELOW
      //** The challenge here is creating the middleware function
      //** ensureAuthenticated(req, res, next), which will check
      //** if a user is authenticated by calling passports isAuthenticated
      //** on the request which in turn checks for req.user is to be defined.
      //** If it is then next() should be called, otherwise we can just respond
      //**  to the request with a redirect to our homepage to login.
      //**  An implementation of this middleware is:

      const ensureAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
          return next()
        }
        res.redirect('/')
      }
        // *! HOME ROUTE
      app.route('/').get((req, res) => {
        if (req.user) {
          res.redirect('/profile')
          console.log(req.user)
        } else {
          res.render(process.cwd() + '/views/pug/index', {
            showLogin: true
          })
          
        }
      })
     //*!SIGNUP ROUTE
      app.route('/signUp').get((req, res) => {
        
          res.render(process.cwd() + '/views/pug/signUp', {
          
          })
            
      })

      // *! LOGIN/SIGN IN  PAGE
      app.route('/signIn').get((req,res)=>{
        res.render(process.cwd() + '/views/pug/signIn')
      });

      // *! LOGIN ROUTE
      app.route('/login').post(
        passport.authenticate('local', {
          failureRedirect: '/signIn',


        }),
        (req, res) => {
          res.redirect('/profile')
        }
      )
      // *!LOGOUT ROUTE
      app.route('/logout').get((req, res) => {
        req.logout()
        res.redirect('/')
      })

      // *!CHANGE PASSWORD PAGE
      app.route('/passwordChange').get(( req,res)=>{
        res.render(process.cwd() + '/views/pug/passwordChange',{
         username:`${req.user.username}`  
        })
      })
      // *!CHANGE PASSWORD ROUTE
      app.route('/passChange').post((req,res)=>{
        User.findOne({_id:req.user._id},function(err,doc){

          if(err){ return console.log('failed to save ')}
          else{
            if(req.body.password===req.body.confirmpassword){
            doc.password=req.body.password;
            doc.save();
            console.log(`password changed successfully of USER:${req.user.username}`) 
       }
      }
      res.redirect('/profile');
        } 
      )
    })
      // *!REGISTRATION ROUTE
      app.route('/register').post(
        (req, res, next) => {
          //*    var username=req.body.username;
          //* const password=req.body.password;
          //* res.send(req.body);
          User.findOne(
            {
              username: req.body.username
            },
            function(err, user) {
              if (err) {
                next(err)
              } else if (user) {
                res.redirect('/')
              } else {
                //*  var hash = bcrypt.hashSync(req.body.password, 12);
                var client = new User()
                client.username = req.body.username
                client.password = req.body.password
                client.email = req.body.email                
                client.save(function(err, client) {
                  if (err) {
                    res.redirect('/')
                  } else {
                    next(null, client)
                  }
                })
              }
            }
          )
        },
        passport.authenticate('local', {
          failureRedirect: '/'
        }),
        (req, res, next) => {
          res.redirect('/profile')
        }
      )
      // *! PROFILE ROUTE
      app.route('/profile').get(ensureAuthenticated, (req, res) => {
          console.log(req.user)
        res.render(process.cwd() + '/views/pug/profile', {
          username: `${req.user.username}`,
          
        })
      })
      
      // *! FORGOT ROUTE GET
      app.get('/forgot', function(req, res) {
        res.render(process.cwd() + '/views/pug/forgot', {
          user: req.user
        });
      });
}