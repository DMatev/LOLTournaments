'use strict';
var User = require('../models/user');
var Team = require('../models/team');
var Tournament = require('../models/tournament');
var HallOfFame = require('../models/hallOfFame');

function getAll(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			Tournament.find(function (err, tournaments){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: tournaments });
			});
		}
	});
}

function getByName(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
				if(err){
					return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
				}
				return next({ status: 200, content: tournament });
			});
		}
	});
}

function create(data, next){
	var tournamentNameLowerCase = data.tournament.name.toLowerCase();
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can create tournaments' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': tournamentNameLowerCase }, function (err, tournamentExist){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(tournamentExist){
						return next({ status: 400, content: { code: 4, field: 'name', description: 'tournament name taken', message: 'This tournament name is already taken' } });
					} else {
						var tournament = new Tournament();
						tournament.name.original = data.tournament.name;
						tournament.name.lowerCase = tournamentNameLowerCase;
						tournament.numberOfCompetitors = data.tournament.numberOfCompetitors;
						if(data.tournament.type){
							tournament.type = data.tournament.type;
						}
						tournament.save(function (err){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							} else {
								return next({ status: 200, content: 'You successfully created tournament' });
							}
						});
					}
				});
			}
		}
	});
}

function startFirstStage(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can start first stage of tournaments' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!tournament){
						return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
					} else {
						tournament.makeFirstStage(function (err){
							if(err){
								if(err === 1){
									return next({ status: 400, content: { code: 25, description: 'tournament is not in "signing" stage', message: 'Tournament is not in "signing" stage' } });
								}
								if(err === 2){
									return next({ status: 400, content: { code: 32, description: 'tournament is not full', message: 'Tournament is not full' } });
								}
							} else {
								tournament.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										return next({ status: 200, content: 'You successfully start tournament' });
									}
								});
							}
						});
					}
				});
			}
		}
	});
}

function setCurrentStageEndDate(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can set end date of the current stage of tournaments' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!tournament){
						return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
					} else {
						tournament.setCurrentStageEnd(data.date);
						tournament.save(function (err){
							if(err){
								return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
							} else {
								return next({ status: 200, content: 'You successfully set the end date of the current stage of this tournament' });
							}
						});
					}
				});
			}
		}
	});
}

function moveCurrentStageToHistory(data, next){
	var tournamentNameLowerCase = data.name.toLowerCase();
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can end stage of tournaments' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': tournamentNameLowerCase }, function (err, tournament){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!tournament){
						return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
					} else {
						tournament.moveCurrentStageToHistory(function (err, history, currentStage){
							if(err){
								if(err === 1){
									return next({ status: 400, content: { code: 33, description: 'tournament stage is not "running"', message: 'Torunament stage is not "running"' } });
								}
								if(err === 2) {
									return next({ status: 400, content: { code: 34, description: 'uncorrect matches', message: 'Not all matches are finished correctly' } });
								}
								if(err === 3){
									return next({ status: 400, content: { code: 35, description: 'last stage of tournament', message: 'This tournament is in his last stage' } });
								}
							} else {
								Tournament.update({ 'name.lowerCase': tournamentNameLowerCase }, { $push: { history: history }, $set: { currentStage: currentStage, resultsFromCaptains: [] } }, { multi: true }, function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										return next({ status: 200, content: 'You successfully end tournament`s stage' });
									}
								});
							}
						});
						
					}
				});
			}
		}
	});
}

function finish(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can end tournaments' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!tournament){
						return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
					} else {
						tournament.finish(function (err){
							if(err){
								if(err === 1){
									return next({ status: 400, content: { code: 33, description: 'tournament stage is not "running"', message: 'Torunament stage is not "running"' } });
								}
								if(err === 2){
									return next({ status: 400, content: { code: 36, description: 'tournament`s stage is not the last stage', message: 'Torunament is not in his last stage' } });
								}
								if(err === 3){
									return next({ status: 400, content: { code: 34, description: 'uncorrect matches', message: 'Not all matches are finished correctly' } });
								}
							} else {
								tournament.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										Team.update({ 'currentTournament': tournament.name.original }, { $set: { 'status': 'free' } }, { multi: true }, function (err){
											if(err){
												return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
											} else {
												var record = new HallOfFame();
												if(tournament.currentStage.matches[0].winner === 0){
													record.team = tournament.currentStage.matches[0].team1;
												} else {
													record.team = tournament.currentStage.matches[0].team2;
												}
												record.tournament = tournament.name.original;
												record.save(function (err){
													if(err){
														return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
													} else {
														return next({ status: 200, content: 'You successfully end tournament' });
													}
												});
											}
										});
									}
								});
							}
						});
						
					}
				});
			}
		}
	});
}

function tryResolveMatches(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can try to resolve matches from current stage of tournament' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!tournament){
						return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
					} else {
						tournament.tryResolveMatches(function(err, fixList){
							if(err){
								return next({ status: 400, content: { code: 33, description: 'tournament stage is not "running"', message: 'Torunament stage is not "running"' } });
							} else {
								tournament.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										if(!fixList){
											return next({ status: 200, content: 'You successfully resolve all matches of the current tournament`s stage' });
										} else {
											return next({ status: 400, content: { code: 34, description: 'uncorrect matches', message: 'Not all matches are finished correctly' } });
										}
									}
								});
							}
						});
					}
				});
			}
		}
	});
}

function resolveMatch(data, next){
	var found = false;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can resolve matches' } });	
			} else {
				Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!tournament){
						return next({ status: 400, content: { code: 24, description: 'tournament not found', message: 'Tournament not found' } });
					} else {
						for(var i=0; i<tournament.currentStage.matches.length; i++){
							if(data.match.id == tournament.currentStage.matches[i]._id){
								tournament.currentStage.matches[i].winner = data.match.winner;
								found = true;
								i = tournament.currentStage.matches.length;
								tournament.save(function (err){
									if(err){
										return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
									} else {
										return next({ status: 200, content: 'You successfully edit match' });
									}
								});
							}
						}
						if(!found){
							return next({ status: 400, content: { code: 37, description: 'match not found', message: 'Match not found' } });
						}
					}
				});
			}
		}
	});
}

exports.getAll = getAll;
exports.getByName = getByName;
exports.create = create;
exports.start = startFirstStage;
exports.end = finish;
exports.stage = {
	setEndDate: setCurrentStageEndDate,
	setNextStage: moveCurrentStageToHistory,
	tryResolveMatches: tryResolveMatches,
	resolveMatch: resolveMatch
};