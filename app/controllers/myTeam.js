var User = require('../models/user');
var Team = require('../models/team');
var Tournament = require('../models/tournament');

function dismiss(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team !== 'string'){
				return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
			} else {
				if(consumer.game.duty !== 'captain'){
					return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can dismiss teams' } });	
				} else {
					Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
						if(err){
							return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						}
						if(!team){
							// fixing the bug
							consumer.game.team = null;
							consumer.game.duty = 'player';
							consumer.save(function (err){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								} else {
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								}
							});
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
};

function create(data, next){
	var nameLowerCase = data.team.name.toLowerCase();
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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
};

function getRequests(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team !== 'string'){
				return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
			} else {
				if(consumer.game.duty !== 'captain'){
					return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can review players requests for joining team' } });	
				} else {
					Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
						if(err){
							return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						}
						if(!team){
							consumer.game.team = null;
							consumer.game.duty = 'player';
							consumer.save(function (err){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								} else {
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								}
							});
						} else {
							return next({ status: 200, content: team.requests });
						}
					});
				}
			}
			
		}
	});
};

function editRequests(data, next){
	var found = false;
	var nameLowerCase = data.name.toLowerCase();
	var index;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team !== 'string'){
				return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
			} else {
				if(consumer.game.duty !== 'captain'){
					return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can approve/disapprove players requests for joininh your teams' } });
				} else {
					Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
						if(err){
							return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						}
						if(!team){
							consumer.game.team = null;
							consumer.game.duty = 'player';
							consumer.save(function (err){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								} else {
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								}
							});
						} else {
							if(team.status !== 'free'){
								return next({ status: 400, content: { code: 17, description: 'team status is not "free"', message: 'Your team status is not "free"' } });
							} else {
								for(var i=0; i<team.requests.length; i++){
									if(nameLowerCase === team.requests[i].toLowerCase()){
										found = true;
										index = i;
										if(data.approved){
											User.findOne({ 'account.username.lowerCase': nameLowerCase }, function (err, user){
												if(err){
													return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
												}
												if(!user){
													team.requests.splice(index, 1);
													team.save(function (err){
														if(err){
															return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
														} else {
															return next({ status: 400, content: { code: 10, description: 'user not found', message: 'User not found' } });
														}
													});
												} else {
													if(typeof user.game.team === 'string'){
														return next({ status: 400, content: { code: 18, description: 'user already have team', message: 'User already have a team' } });
													} else {
														if(team.players.length > 4){
															return next({ status: 400, content: { code: 21, description: 'team is full', message: 'Your team is full' } });
														} else {
															team.requests.splice(index, 1);
															team.players.push(user.account.username.original);
															team.save(function (err){
																if(err){
																	return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
																} else {
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
															});
														}
														
													}
												}
											});
										} else {
											team.requests.splice(index, 1);
											team.save(function (err){
												if(err){
													return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
												} else {
													return next({ status: 200, content: 'You successfully disapproved player`s request for joining your team' });
												}
											})
											
										}
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
};

function kickMember(data, next){
	var found = false;
	var nameLowerCase = data.name.toLowerCase();
	var index;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team !== 'string'){
				return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
			} else {
				if(consumer.game.duty !== 'captain'){
					return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can kick players from the team' } });
				} else {
					Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
						if(err){
							return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						}
						if(!team){
							consumer.game.team = null;
							consumer.game.duty = 'player';
							consumer.save(function (err){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								} else {
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								}
							});	
						} else {
							if(team.status !== 'free'){
								return next({ status: 400, content: { code: 17, description: 'team status is not "free"', message: 'Your team status is not "free"' } });
							} else {
								if(nameLowerCase === consumer.account.username.lowerCase){
									return next({ status: 400, content: { code: 22, description: 'captain cant kick himself', message: 'You cant kick yourself from your team' } });
								} else {
									for(var i=0; i<team.players.length; i++){
										if(nameLowerCase === team.players[i].toLowerCase()){
											found = true;
											index = i;
											User.findOne({ 'account.username.lowerCase': nameLowerCase }, function (err, user){
												if(err){
													return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
												}
												team.players.splice(index, 1);
												team.save(function (err){
													if(err){
														return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
													} else {
														if(user){
															user.game.team = null;
															user.game.duty = 'player';
															user.save(function (err){
																if(err){
																	return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
																} else {
																	return next({ status: 200, content: 'You successfully kick player from your team' });
																}
															});
														} else {
															return next({ status: 200, content: 'You successfully kick player from your team' });
														}
													}
												});
											});
										}
									}
									if(!found){
										return next({ status: 400, content: { code: 23, description: 'player not found', message: 'You dont have this player in your team' } });
									}
								}
							}       
						}
					});
				}
			}	
		}
	});
};

function signinTournament(data, next){
	var found = false;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team !== 'string'){
				return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
			} else {
				if(consumer.game.duty !== 'captain'){
					return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains sign in tournaments' } });
				} else {
					Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
						if(err){
							return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						}
						if(!team){
							consumer.game.team = null;
							consumer.game.duty = 'player';
							consumer.save(function (err){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								} else {
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								}
							});	
						} else {
							if(team.status !== 'free'){
								return next({ status: 400, content: { code: 17, description: 'team status is not "free"', message: 'Your team status is not "free"' } });
							} else {
								if(team.players.length !== 5){
									return next({ status: 400, content: { code: 27, description: 'team is not full', message: 'Your team must have 5 members in order to sign at tournaments' } });
								} else {
									Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
										if(err){
											return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
										}
										if(!tournament){
											return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
										} else {
											if(!tournament.stage.isSigningOpen){
												return next({ status: 400, content: { code: 25, description: 'tournament is not in "signing" stage', message: 'Tournament is not in "signing" stage' } });
											} else {
												for(var i=0; i<tournament.teams.length; i++){
													if(consumer.game.team === tournament.teams[i].name){
														found = true;
														return next({ status: 400, content: { code: 26, description: 'team already signed in tournament', message: 'Your team is already signed in this tournament' } });
													}
												}
												if(!found){
													if(tournament.teams.length < tournament.numberOfCompetitors){
														var signingTeam = {};
														signingTeam.name = team.name.original;
														signingTeam.captain = team.captain;
														signingTeam.players = [];
														for(var j=0; j<team.players.length; j++){
															signingTeam.players.push(team.players[j]);
														}
														tournament.teams.push(signingTeam);
														tournament.save(function (err){
															if(err){
																return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
															} else {
																team.status = 'signed';
																team.save(function (err){
																	if(err){
																		return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
																	} else {
																		return next({ status: 200, content: 'You successfully signed your team at tournament' });
																	}
																});
															}
														});
													} else {
														return next({ status: 400, content: { code: 31, description: 'tournament is full', message: 'Tournament is full' } });
													}
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
		}
	});
};

function sendScoreTournament(data, next){
	var found = false;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team !== 'string'){
				return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
			} else {
				if(consumer.game.duty !== 'captain'){
					return next({ status: 403, content: { code: 9, description: 'forbidden, captaions only', message: 'Only captains can send match score' } });
				} else {
					Team.findOne({ 'name.original': consumer.game.team }, function (err, team){
						if(err){
							return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
						}
						if(!team){
							consumer.game.team = null;
							consumer.game.duty = 'player';
							consumer.save(function (err){
								if(err){
									return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
								} else {
									return next({ status: 400, content: { code: 16, description: 'user dont have team', message: 'You dont have a team' } });
								}
							});	
						} else {
							if(team.status !== 'signed'){
								return next({ status: 400, content: { code: 28, description: 'team status is not "signed"', message: 'Your team is not signed at tournament' } });
							} else {
								Tournament.findOne({ 'teams.name': consumer.game.team }, function (err, tournament){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									}
									if(!tournament){
										return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Your team is not signed at tournament' } });
									} else {
										if(tournament.stage !== 'competing'){
											return next({ status: 400, content: { code: 29, description: 'tournament is not in "competing" stage', message: 'Tournament is not in "competing" stage' } });
										} else {
											for(var i=0; i<tournament.resultsFromCaptains.length; i++){
												if(consumer.game.team === tournament.resultsFromCaptains[i].name){
													found = true;
													return next({ status: 400, content: { code: 30, description: 'captain already send match score', message: 'You already send your match score' } });
												}
											}
											if(!found){
												var score = {};
												score.name = consumer.game.team;
												score.won = data.won;
												tournament.resultsFromCaptains.push(score);
												tournament.save(function (err){
													if(err){
														return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
													} else {
														return next({ status: 200, content: 'You successfully send your match score' });
													}
												});
											}
										}
									}
								});
							}       
						}
					});
				}
			}	
		}
	});
};

exports.dismiss = dismiss;
exports.create = create;
exports.kick = kickMember;
exports.requests = {
	review: getRequests,
	edit: editRequests
};
exports.tournament = {
	signin: signinTournament,
	sendScore: sendScoreTournament
}