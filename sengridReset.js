'use strict'
require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const LocalStrategy = require('passport-local');
// const passport = require('passport');
// const bcrypt = require('bcryptjs');
const async =require('async');
const crypto = require('crypto');
// const cookieParser=require('cookie-parser');
const nodemailer=require('nodemailer');
// const flash = require('connect-flash');
const { User } = require('./User')

module.exports=function(app,db){
    // *! FORGOT ROUTE POST
    app.post('/forgotpass', function(req, res, next) {
        async.waterfall([
          function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
              if (!user) {
                
                //* req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
              }
    
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 1800000; //! 30 minutes
      
              user.save(function(err) {
                done(err, token, user);
              });
            });
          },
          function(token, user, done) {
            var client = nodemailer.createTransport( {
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass:process.env.SENDGRID_PASSWORD 
              }
            });
            var email = {
              from: 'yourmail@mail.com',
              to: user.email,
              subject: 'Please reset the password for your account',
              text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n',
              //* html:'<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n</p>'
            };
            
            client.sendMail(email, function(err,info) {
              req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
              done(err, 'done'); 
            });
          }
        ], function(err) {
          if (err) return next(err);
          res.redirect('/forgot');
        });
      });
      // *!RESET ROUTE GET
      app.get('/reset/:token', function(req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
          }
          res.render(process.cwd() + '/views/pug/reset', {
            user: req.user
          });
        });
      });

      // *!RESET ROUTE POST
      app.post('/reset/:token', function(req, res) {
        async.waterfall([
          function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
              if (!user) {
                //* req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
              }
      
              user.password = req.body.password;
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
      
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            });
          },
          function(user, done) {
            var client = nodemailer.createTransport( {
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
              
              }
            });
            var Options = {
              to: user.email,
              from: 'akibhasan.bd@gmail.com',
              subject: 'Your password has been changed',
              text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            client.sendMail(Options, function(err,info) {
              req.flash('success', 'Success! Your password has been changed.');
              done(err);
            });
          }
        ], function(err) {
          res.redirect('/');
        });
      });

}