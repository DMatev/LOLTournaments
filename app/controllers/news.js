'use strict';
var User = require('../models/user');
var News = require('../models/news');
var Comment = require('../models/comment').model;

function getAllVisibleNews(next){
	News.find({ 'isVisible': true }, function (err, news){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		return next({ status: 200, content: news });
	});
}

function getAllNews(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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
}

function getByIdNews(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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
}

function publishNews(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(consumer.account.role !== 'admin'){
				return next({ status: 403, content: { code: 8, description: 'forbidden, admins only', message: 'Only admins can create news' } });	
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
}

function editNews(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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
}

function removeNews(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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
}

function makeComment(data, next){
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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
}

function removeComment(data, next){
	var found = false;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
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

exports.getAllVisible = getAllVisibleNews;
exports.getAll = getAllNews;
exports.getById = getByIdNews;
exports.publish = publishNews;
exports.edit = editNews;
exports.remove = removeNews;
exports.comments = {
	publish: makeComment,
	remove: removeComment
};