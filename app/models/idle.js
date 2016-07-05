var mongodb = require('./db');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var markdown = require('markdown').markdown;
function Idle(idle) {
	this._id = idle._id;
	this.title = idle.title;
	this.content = idle.content;
	this.html_content = idle.html_content;
	this.createdate = idle.createdate;
	this.editdate = idle.editdate;
	this.time = idle.time;
	this.istop = idle.top || 'N';
	this.back_img = idle.back_img;
	this.imgs = idle.imgs;
	this.quote = idle.quote;
};

module.exports = Idle;

//save a new idle to collection
Idle.save = function save(idle, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//change the format of date
			var date = new Date();
			idle.createdate = moment(date).format("YYYY-MM-DD HH:mm:ss");
			idle.time = {
				year: moment(date).format("YYYY"),
				month: moment(date).format("YYYY-MM"),
				day: moment(date).format("YYYY-MM-DD"),
				minute: moment(date).format("HH:mm")
			};
			idle.html_content = markdown.toHTML(idle.content);
			//img
			var imgs = [];
			console.log(idle);
			collection.insert(idle, {
				safe: true
			}, function(err) {
				mongodb.close();
				callback(err);
			});
		});
	});
};
//modify idle info
Idle.updateIdle = function updateIdle(idle, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				console.log(err);
				mongodb.close();
				return callback(err);
			}
			console.log(idle);
			var date = new Date();
			console.log(moment(date).format("YYYY-MM-DD HH:mm:ss"));
			idle.html_content = markdown.toHTML(idle.content);
			//back_img
			collection.update({
				"_id": ObjectId(idle._id)
			}, {
				$set: {
					'title': idle.title,
					'content': idle.content,
					'html_content': idle.html_content,
					'editdate': moment(date).format("YYYY-MM-DD HH:mm:ss"),
					'back_img':idle.back_img,
					'tags': tags,
					'quote': idle.quote,
				}
			}, function(err) {
				console.log(err)
				mongodb.close();
				return callback(err);
			});
		});
	});
}

//search idle by id
Idle.findById = function findById(id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"_id": ObjectId(id)
			}, function(err, doc) {
				mongodb.close();
				if (doc) {
					//封装文档为User对象
					var idle = new Idle(doc);
					callback(err, idle);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

//get all idles 
Idle.getAll = function getAll(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.count(function(err, count) {
				if (err) {
					return callback(err, null, 0);
				} else {
					collection.find({}, {
						sort: {
							createdate: -1
						}
					}).toArray(function(err, idles) {
						mongodb.close();
						if (err) {
							callback(err, null, 0);
						} else {
							callback(err, idles, count);
						}
					});
				}
			});

		});
	});
};

//delete idle by id
Idle.deleteById = function deleteById(id, callback) {
	console.log(id + " models");
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				"_id": ObjectId(id)
			}, function(err, idle) {
				console.log(idle);
				if (idle) {
					collection.remove({
						_id: ObjectId(id)
					}, function(err, id) {
						mongodb.close();
						callback(err, null);
					});
				} else {
					mongodb.close();
					callback(err, null);
				}
			});
		});
	});
};

//get the top idle to show it on home page
Idle.getTopIdle = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.count(function(err, count) {
				if (err) {
					return callback(err, null, 0);
				} else {
					collection.find({
						"istop": 'Y'
					}, {
						sort: {
							createdate: -1
						}
					}).toArray(function(err, idles) {
						mongodb.close();
						if (err) {
							callback(err, null, 0);
						} else {
							callback(err, idles, count);
						}
					});
				}
			});

		});
	});
}

//set the top idle to show it on home page
Idle.setTopIdle = function(id, istop, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			console.log(err);
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				console.log(err);
				mongodb.close();
				return callback(err);
			}
			collection.update({
				_id: ObjectId(id)
			}, {
				$set: {
					'istop': istop
				}
			}, function(err) {
				console.log(err);
				mongodb.close();
				callback(err, null);
			});
		});
	});
}

//get all idles by group
Idle.getViewInfo = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('idles', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//var group = {
			//	key: {
			//		'time.month': true
			//	},
			//	cond: null,
			//	reduce: function(doc, out) {
			//		out.count++;
			//		out.idles.push(doc);
			//	},
			//	initial: {
			//		idles: [],
			//		count: 0
			//	},
			//	finalize: function(out) {
			//		// out.avg = out.total / out.count;
			//	}
			//};
			//collection.group(group.key, group.cond, group.initial, group.reduce, group.finalize, true, function(err, results) {
			//	console.log(results);
			//	var compare, compare2;
			//	compare = function(value1, value2) {
			//		return new Date(value2['time.month']) - new Date(value1['time.month']);
			//	};
			//	compare2 = function(value1, value2) {
			//		return value1.date - value2.date;
			//	};
			//	results.sort(compare).forEach(function(item, index, arr) {
			//		return item.idles.sort(compare2);
			//	});
			//	return callback(err, results);
			//});
			var pipeline = [
				{$unwind: "$time"},
				{
					$group: {
						_id: "$time.month",
						count: {$sum: 1},
						idles: {$push: "$$ROOT"}
					}
				},
				{$sort: {_id: -1}}
			];
			collection.aggregate(pipeline, function (err, results) {
				console.log(results);
				var compare;
				compare = function (value1, value2) {
					return value1.date - value2.date;
				};
				results.forEach(function (item, index, arr) {
					return item.idles.sort(compare);
				});
				return callback(err, results);
			});
		});
	});
}