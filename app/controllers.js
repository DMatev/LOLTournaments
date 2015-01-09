var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var config = require('./config');
var Server = require('./models/server');
var User = require('./models/user');
var News = require('./models/news');
var HallOfFame = require('./models/hallOfFame');
var Comment = require('./models/comment').model;
var Team = require('./models/team');

module.exports = {
	signin: function (data, next){
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
	},

	signup: function (data, next){
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
	},

	recovery : {
		request: function (data, next){
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
		},
		change: function (data, next){
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
		}
	},

	news: {
		getAllVisible: function(next){
			News.find({ 'isVisible': true }, function (err, news){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: news });
			});
		},
		getAll: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can view all news' } });	
					} else {
						News.find(function (err, news){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							return next({ status: 200, content: news });
						});
					}
				}
			});
		},
		get: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can view all news' } });	
					} else {
						News.findById(data.news.id, function (err, news){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							return next({ status: 200, content: news });
						});
					}
				}
			});
		},
		post: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can post news' } });	
					} else {
						var news = new News();
						news.title = data.news.title;
						news.content = data.news.content; 
						news.createDate = new Date();
						if(data.news.author){
							news.author = data.news.author;
						}
						if(data.news.isVisible === false){
							news.isVisible = false;
						}
						news.save(function (err){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							} else {
								return next({ status: 200, content: 'You successfully created news' });
							}
						});
					}
				}
			});
		},
		edit: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can edit news' } });	
					} else {
						News.findById(data.news.id, function (err, news){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							if(!news){
								return next({ status: 400, content: { code: 11, description: 'news not found', message: 'News not found' } });
							} else {
								news.createDate = new Date();
								if(data.news.title){
									news.title = data.news.title;
								}
								if(data.news.content){
									news.content = data.news.content;
								}
								if(data.news.author){
									news.author = data.news.author;
								}
								if(data.news.isVisible === false){
									news.isVisible = false;
								}
								if(data.news.isVisible === true){
									news.isVisible = true;
								}
								news.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										return next({ status: 200, content: 'You successfully edited news' });
									}
								});
							}
						});
					}
				}
			});
		},
		remove: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can remove news' } });	
					} else {
						News.remove({ _id: data.news.id }, function (err, result){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							if(result === 0){
								return next({ status: 400, content: { code: 11, description: 'news not found', message: 'News not found' } });
							}
							if(result === 1){
								return next({ status: 200, content: 'You successfully removed news' });
							}
						});
					}
				}
			});
		},
		comment: {
			post: function (data, next){
				User.findById(data.consumer.id, function (err, consumer){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!consumer){
						return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
					} else {
						News.findById(data.news.id, function (err, news){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							if(!news){
								return next({ status: 400, content: { code: 11, description: 'news not found', message: 'News not found' } });
							} else {
								var comment = new Comment();
					            comment.postDate = new Date();
					            comment.author = consumer.account.username.original;
					            comment.content = data.comment.content;
					            news.comments.push(comment);				  
								news.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										return next({ status: 200, content: 'You successfully post comment' });
									}
								});
							}
						});
					}
				});
			},
			remove: function (data, next){
				var found = false;
				User.findById(data.consumer.id, function (err, consumer){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!consumer){
						return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
					} else {
						if(consumer.account.role !== 'admin'){
							return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can remove comments' } });	
						} else {
							News.findById(data.news.id, function (err, news){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								}
								if(!news){
									return next({ status: 400, content: { code: 11, description: 'news not found', message: 'News not found' } });
								} else {
									for(var i=0; i<news.comments.length; i++){
										if(news.comments[i]._id == data.comment.id){ //USED 2 EQUELS INSTEAD OF 3
											found = true;
											news.comments.id(data.comment.id).remove();
											news.save(function (err){
												if(err){
													return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
												} else {
													return next({ status: 200, content: 'You successfully deleted comment' });
												}
											});
										}
									}
									if(!found){
										return next({ status: 400, content: { code: 12, description: 'comment not found', message: 'Comment not found' } });
									}
								}
							});
						}
					}
				});
			}
		}
	},

	hallOfFame: {
		getAll: function (next){
			HallOfFame.find(function (err, teams){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: teams });
			});
		},
		post: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can post records for Hall Of Fame' } });	
					} else {
						var record = new HallOfFame();
						record.team = data.record.team;
						record.tournament = data.record.tournament;
						record.save(function (err){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							} else {
								return next({ status: 200, content: 'You successfully created record for Hall Of Fame' });
							}
						});
					}
				}
			});
		},
		edit: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can edit records of Hall Of Fame' } });	
					} else {
						HallOfFame.findById(data.record.id, function (err, record){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							if(!record){
								return next({ status: 400, content: { code: 13, description: 'recor not found', message: 'Record not found' } });
							} else {
								if(data.record.team){
									record.team = data.record.team;
								}
								if(data.record.tournament){
									record.tournament = data.record.tournament;
								}
								record.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										return next({ status: 200, content: 'You successfully edited record of Hall Of Fame' });
									}
								});
							}
						});
					}
				}
			});
		},
		remove: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(consumer.account.role !== 'admin'){
						return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can remove records from Hall Of Fame' } });	
					} else {
						HallOfFame.remove({ _id: data.record.id }, function (err, result){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							if(result === 0){
								return next({ status: 400, content: { code: 13, description: 'record not found', message: 'Record not found' } });
							}
							if(result === 1){
								return next({ status: 200, content: 'You successfully removed record from Hall Of Fame' });
							}
						});
					}
				}
			});
		}
	},

	teams: {
		getAll: function (next){
			Team.find(function (err, teams){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: teams });
			});
		},
		getById: function (data, next){
			Team.findById(data.team.id, function (err, team){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: team });
			});
		},
		getByName: function (data, next){
			Team.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, team){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: team });
			});
		},
		remove: function (data, next){
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(typeof consumer.game.team !== 'string'){
						return next({ status: 400, content: { code: 16, description: 'user dont have found', message: 'You dont have a team' } });
					} else {
						if(consumer.game.duty !== 'captain'){
							return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can dismiss teams' } });	
						} else {
							Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								}
								if(!team){
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								} else {
									if(team.status !== 'free'){
										return next({ status: 400, content: { code: 17, description: 'team status is not "free"', message: 'Your team status is not "free"' } });
									} else {
										User.update({ 'game.team': consumer.game.team }, { $set: { 'game.team': null, 'game.duty': 'player' } }, { multi: true }, function (err){
											if(err){
												return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
											} else {
												Team.remove({ 'name.original': consumer.game.team }, function (err){
													if(err){
														return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
													} else {
														return next({ status: 200, content: 'You successfully dismissed your team' });
													}
												});
											}
										});
									}
								}
							});
						}
					}
					
				}
			});
		},
		post: function (data, next){
			var nameLowerCase = data.team.name.toLowerCase();
			User.findById(data.consumer.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					if(typeof consumer.game.team === 'string'){
						return next({ status: 400, content: { code: 18, description: 'user already have team', message: 'You already have a team' } });
					} else {
						Team.findOne({ 'name.lowerCase': nameLowerCase }, function (err, teamExist){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							}
							if(teamExist){
								return next({ status: 400, content: { code: 4, field: 'name', description: 'name taken', message: 'This name for the team is already taken' } });
							} else {
								var team = new Team();
								team.name.original = data.team.name;
				                team.name.lowerCase = nameLowerCase;
				                team.players = [];
				                team.players.push(consumer.account.username.original);
				                team.captain = consumer.account.username.original;
				                team.save(function (err){
				                  if(err){
				                    return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				                  } else {
				                    consumer.game.duty = 'captain';
				                    consumer.game.team = data.team.name;
				                    consumer.save(function (err){
				                      if(err){
				                        return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				                      } else {
				                        return next({ status: 200, content: 'You successfully created team' });
				                      }
				                    });
				                  }
				                });
							}
						});
					}
					
				}
			});
		},
		requests: {
			get: function (data, next){
				User.findById(data.consumer.id, function (err, consumer){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!consumer){
						return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
					} else {
						if(typeof consumer.game.team !== 'string'){
							return next({ status: 400, content: { code: 16, description: 'user dont have found', message: 'You dont have a team' } });
						} else {
							if(consumer.game.duty !== 'captain'){
								return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can review players requests for joining team' } });	
							} else {
								Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									}
									if(!team){
										return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
									} else {
										return next({ status: 200, content: team.requests });
									}
								});
							}
						}
						
					}
				});
			},
			post: function (data, next){
				var found = false;
				User.findById(data.consumer.id, function (err, consumer){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!consumer){
						return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
					} else {
						if(typeof consumer.game.team === 'string'){
							return next({ status: 400, content: { code: 18, description: 'user already have team', message: 'You already have a team' } });
						} else {
							Team.findOne({ 'name.lowerCase': data.team.name.toLowerCase() }, function (err, team){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								}
								if(!team){
									return next({ status: 500, content: { code: 14, description: 'team not found', message: 'Team not found' } });
								} else {
									for(var i=0; i<team.requests.length; i++){
										if(consumer.account.username.original === team.requests[i]){
											found = true;
											return next({ status: 400, content: { code: 19, description: 'user already send request to join this team', message: 'You already have send request to join this team' } });
										}
									}
									if(!found){
										team.requests.push(consumer.account.username.original);
						                team.save(function (err){
						                	if(err){
						                    	return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						                  	} else {
						                    	return next({ status: 200, content: 'You successfully send request to join team' });
						                  	}
						                });	
									}       
								}
							});
						}	
					}
				});
			},
			edit: function (data, next){
				var found = false;
				var nameLowerCase = data.name;
				var index;
				User.findById(data.consumer.id, function (err, consumer){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!consumer){
						return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
					} else {
						if(typeof consumer.game.team !== 'string'){
							return next({ status: 400, content: { code: 16, description: 'user dont have found', message: 'You dont have a team' } });
						} else {
							if(consumer.game.duty !== 'captain'){
								return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can approve/disapprove players requests for joininh your teams' } });
							} else {
								Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									}
									if(!team){
										return next({ status: 500, content: { code: 14, description: 'team not found', message: 'Team not found' } });
									} else {
										if(team.status !== 'free'){
											return next({ status: 400, content: { code: 17, description: 'team status is not "free"', message: 'Your team status is not "free"' } });
										} else {
											for(var i=0; i<team.requests.length; i++){
												if(nameLowerCase === team.requests[i].toLowerCase()){
													found = true;
													index = i;
													team.requests.splice(index, 1);
													team.save(function (err){
														if(err){
															return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
														} else {
															if(data.approved){
																User.findOne({ 'account.username.lowerCase': nameLowerCase }, function (err, user){
																	if(err){
																		return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
																	}
																	if(!user){
																		return next({ status: 400, content: { code: 10, description: 'user not found', message: 'User not found' } });
																	} else {
																		if(typeof user.game.team === 'string'){
																			return next({ status: 400, content: { code: 18, description: 'user already have team', message: 'User already have a team' } });
																		} else {
																			// should put player into team.players array if max team numbers are bellow 5
																			user.game.team = team.name.original;
																			user.game.duty = 'player';
																			user.save(function (err){
																				if(err){
																					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
																				} else {
																					return next({ status: 200, content: 'You successfully approved player`s request for joining your team' });
																				}
																			});
																		}
																	}
																});
															} else {
																return next({ status: 200, content: 'You successfully disapproved player`s request for joining your team' });
															}
														}
													});
												}
											}
											if(!found){
												return next({ status: 400, content: { code: 20, description: 'request not found', message: 'You dont have request from this user' } });
											}
										}       
									}
								});
							}
							
						}	
					}
				});
			}
		}
	},

	users : {
		getInfo: function (data, next){
			User.findById(data.id, function (err, consumer){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				if(!consumer){
					return next({ status: 500, content: { code: 10, description: 'user not found', message: 'User not found' } });
				} else {
					return next({ status: 200, content: { username: consumer.account.username.original, email: consumer.account.email.original, role: consumer.account.role, team: consumer.game.team, duty: consumer.game.duty } });
				}
			});
		}
	}
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