var User = require('../models/user');
var Tournament = require('../models/tournament');
var HallOfFame = require('../models/hallOfFame');

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
};

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
								return next({ status: 400, content: { code: 32, description: 'tournament is not full or is not in "signing" stage', message: 'You cant do this action right now, please try again later' } });
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
};

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
};

function moveCurrentStageToHistory(data, next){
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
				Tournament.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, tournament){
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
								Tournament.update({ 'name.lowerCase': data.name.toLowerCase() }, { $push: { history: history }, $set: { currentStage: currentStage } }, { multi: true }, function (err, result){
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
};

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
		}
	});
};

exports.create = create;
exports.start = startFirstStage;
exports.end = finish;
exports.stage = {
	setEndDate: setCurrentStageEndDate,
	setNextStage: moveCurrentStageToHistory
};