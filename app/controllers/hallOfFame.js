var User = require('../models/user');
var HallOfFame = require('../models/hallOfFame');

function getAll(next){
	HallOfFame.find(function (err, teams){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		return next({ status: 200, content: teams });
	});
};

function publish(data, next){
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
}

function edit(data, next){
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
};

function remove(data, next){
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
};

exports.getAll = getAll;
exports.publish = publish;
exports.edit = edit;
exports.remove = remove;