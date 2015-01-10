var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var config = require('../config');
var Server = require('../models/server');
var User = require('../models/user');

function signin(data, next){
	Server.findOne({ 'name': config.server.name }, function (err, server){
      if(err){
        return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
      }
      if(!server){
        return next({ status: 500, content: { code: 1, description: 'server not found', message: 'Server is busy, please try again later' } });
      } else {
        if(!server.isLogInOpen){
          return next({ status: 401, content: { code: 6, description: 'server signin is closed', message: 'We are sorry, but we have too many users online right now. Please try again later' } });
        } else {
    		User.findOne({ 'account.username.lowerCase': data.username.toLowerCase() }, function (err, user){
	            if(err){
	              return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
	            }
	            if(!user){
	              return next({ status: 401, content: { code: 10, description: 'user not found', message: 'User not found' } });
	            } else {
	              if(!user.validPassword(data.password)){
	                return next({ status: 401, content: { code: 5, description: 'wrong password', message: 'Oops! Wrong password' } });
	              } else {
	                return next({ status: 200, content: { token: jwt.sign({ id: user._id }, config.jwtSecret, { expiresInMinutes: 60*5 }) } });
	              }
	            }
	        });
        }
      }
    });
};

function signup(data, next){
	var usernameLowerCase = data.username.toLowerCase();
	var emailLowerCase = data.email.toLowerCase();
	Server.findOne({ 'name': config.server.name }, function (err, server){
      if(err){
        return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
      }
      if(!server){
        return next({ status: 500, content: { code: 1, description: 'server not found', message: 'Server is busy, please try again later' } });
      } else {
        if(!server.isSignUpOpen){
          return next({ status: 401, content: { code: 7, description: 'server signup is closed', message: 'We are sorry, but we have too many registered users right now. Please try again later' } });
        } else {
    		User.findOne({ 'account.username.lowerCase': usernameLowerCase }, function (err, userExist){
	            if(err){
	              return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
	            }
	            if(userExist){
	            	return next({ status: 400, content: { code: 4, field: 'username', description: 'username taken', message: 'This username is already taken' } });
	            } else {
	              User.findOne({ 'account.email.lowerCase': emailLowerCase }, function (err, emailExist){
	                if(err){
	                  return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
	                }
	                if(emailExist){
	                  return next({ status: 400, content: { code: 4, field: 'email', description: 'email taken', message: 'This email is already taken' } });
	                } else {
	                  var user = new User();
	                  user.account.username.original = data.username;
	                  user.account.username.lowerCase = usernameLowerCase;
	                  user.account.password = user.generateHash(data.password);
	                  user.account.email.original = data.email;
	                  user.account.email.lowerCase = emailLowerCase;
	                  user.account.recoveryCode = user.genrateRecoveryCode();
	                  user.save(function (err) {
	                    if(err){
	                      return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
	                    } else {
	                      return next({ status: 200, content: { token: jwt.sign({ id: user._id }, config.jwtSecret, { expiresInMinutes: 60*5 }) } });
	                    }
	                  });
	                }
	              });
	            }
	        });    
        }
      }
    });
};

function recoveryRequest(data, next){
	User.findOne({ 'account.username.lowerCase': data.username.toLowerCase() }, function (err, user){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!user){
			return next({ status: 400, content: { code: 10, description: 'user not found', message: 'User not found' } });
		} else {
			sendRecoveryCodeMail(user.account.email.lowerCase, user.account.recoveryCode);
			return next({ status: 200, content: 'We send you an email with recovery code for your password change' });
		}
	});
};

function recoveryChange(data, next){
	User.findOne({ 'account.username.lowerCase': data.username.toLowerCase() }, function (err, user){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!user){
			return next({ status: 400, content: { code: 10, description: 'user not found', message: 'User not found' } });
		} else {
			if(user.account.recoveryCode === data.recoveryCode){
				user.account.password = user.generateHash(data.password);
				user.save(function (err){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					} else {
						return next({ status: 200, content: 'You successfully changed your password' });
					}
				});
	        } else {
	        	return next({ status: 401, content: { code: 5, description: 'wrong recoveryCode', message: 'This recovery code is wrong' } });
	        }
		}
	});
};

var smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'manageroflegends@gmail.com',
      pass: 'kreposb1tches'
  }
});
var sendRecoveryCodeMail = function (reciever, code){
  smtpTransport.sendMail({
      from: "LOLTournaments <manageroflegends@gmail.com>",
      to: '"' + reciever + '"',
      subject: "Password recovery",
      text: "Password recovery",
      html: "The code for changing your password is: <b>" + code +" </b>"
  });
};

exports.signin = signin;
exports.signup = signup;
exports.recovery = {
	request: recoveryRequest,
	change: recoveryChange
};