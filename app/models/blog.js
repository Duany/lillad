var mongodb = require('./db');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
var fs = require('fs');
var markdown = require('markdown').markdown;
function Blog(blog) {
    this._id = blog._id;
    this.title = blog.title;
    this.content = blog.content;
    this.html_content = blog.html_content;
    this.createdate = blog.createdate;
    this.editdate = blog.editdate;
    this.time = blog.time;
    this.istop = blog.top || 'N';
    this.tags = blog.tags;
};

module.exports = Blog;

//insert a new blog into collection
Blog.save = function save(blog, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //change the format of date
            var date = new Date();
            blog.createdate = date;
            blog.html_content = markdown.toHTML(blog.content);
            blog.time = {
                year: moment(date).format("YYYY"),
                month: moment(date).format("YYYY-MM"),
                day: moment(date).format("YYYY-MM-DD"),
                minute: moment(date).format("HH:mm")
            };
            //tag 标签
            var tags = [];
            if (blog.tag) {
                var tagArr = blog.tag.split(',');
                for (var i = 0; i < tagArr.length; i++) {
                    var tag = {};
                    tag.tag = tagArr[i];
                    tag.id = i + 1;
                    tags[tags.length] = tag;
                }
            }
            blog.tags = tags;
            delete blog.tag;
            collection.insert(blog, {
                safe: true
            }, function (err) {
                mongodb.close();
                callback(err);
            });
        });
    });
};
//modify blog info
Blog.updateBlog = function updateBlog(blog, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                console.log(err);
                mongodb.close();
                return callback(err);
            }
            //tag 标签
            var tags = [];
            console.log("blog.tag " + blog.tag);
            if (blog.tag) {
                var tagArr = blog.tag.split(",");
                for (var i = 0; i < tagArr.length; i++) {
                    var tag = {};
                    tag.tag = tagArr[i];
                    tag.id = i + 1;
                    tags[tags.length] = tag;
                }
            }
            blog.html_content = markdown.toHTML(blog.content);
            console.log(blog);
            var date = new Date();
            collection.update({
                "_id": ObjectId(blog._id)
            }, {
                $set: {
                    'title': blog.title,
                    'content': blog.content,
                    'editdate': date,
                    'tags': tags,
                    'html_content': blog.html_content
                }
            }, function (err) {
                console.log(err)
                mongodb.close();
                return callback(err);
            });
        });
    });
}

//search blog by id
Blog.findById = function findById(id, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "_id": ObjectId(id)
            }, {
                $inc: {
                    "pv": 1
                }
            });
            collection.findOne({
                "_id": ObjectId(id)
            }, function (err, doc) {
                mongodb.close();
                if (doc) {
                    //封装文档为User对象
                    var blog = new Blog(doc);
                    callback(err, blog);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};

//get all blogs
Blog.getAll = function getAll(callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.count(function (err, count) {
                if (err) {
                    return callback(err, null, 0);
                } else {
                    collection.find({}, {
                        sort: {
                            createdate: -1
                        }
                    }).toArray(function (err, blogs) {
                        mongodb.close();
                        if (err) {
                            callback(err, null, 0);
                        } else {
                            callback(err, blogs, count);
                        }
                    });
                }
            });

        });
    });
};

//delete blog by id
Blog.deleteById = function deleteById(id, callback) {
    console.log(id + " models");
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id": ObjectId(id)
            }, function (err, blog) {
                console.log(blog);
                if (blog) {
                    collection.remove({
                        _id: ObjectId(id)
                    }, function (err, id) {
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

//get the top blogs to show them on home page
Blog.getTopBlog = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.count(function (err, count) {
                if (err) {
                    return callback(err, null, 0);
                } else {
                    collection.find({
                        "istop": 'Y'
                    }, {
                        sort: {
                            createdate: -1
                        }
                    }).toArray(function (err, blogs) {
                        mongodb.close();
                        if (err) {
                            callback(err, null, 0);
                        } else {
                            callback(err, blogs, count);
                        }
                    });
                }
            });

        });
    });
}

//set the blog top to show in home page
Blog.setTopBlog = function (id, istop, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
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
            }, function (err) {
                console.log(err);
                mongodb.close();
                callback(err, null);
            });
        });
    });
}

//get the blogs in group 
Blog.getViewInfo = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pipeline = [
                {$unwind: "$time"},

                {
                    $group: {
                        _id: "$time.month",
                        count: {$sum: 1},
                        blogs: {$push: "$$ROOT"}
                    }
                },
                {$sort: {_id: -1}}
            ];
            collection.aggregate(pipeline, function (err, results) {
                var compare;
                compare = function (value1, value2) {
                    return new Date(value1.createdate) - new Date(value2.createdate);
                };
                results.forEach(function (item, index, arr) {
                    return item.blogs.sort(compare);
                });
                return callback(err, results);
            });
        });
    });
}

Blog.getNextPage = function (pageobj, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                console.log(err);
                mongodb.close();
                return callback(err);
            }
            //获取所有总数
            collection.count(function (err, count) {
                if (err) {
                    return callback(err, null, 0);
                } else {
                    if(!pageobj.last_date){
                        pageobj.last_date = moment(new Date()).format('yyyy-MM-dd HH:mm:ss');
                    }
                    collection.find({
                        "createdate": {"$lt": pageobj.last_date}
                    }, {
                        sort: {
                            createdate: -1
                        }
                    }).limit(pageobj.pagenum).toArray(function (err, blogs) {
                        mongodb.close();
                        if (err) {
                            callback(err, null, 0);
                        } else {
                            callback(err, blogs, count);
                        }
                    });
                }
            });
        });
    });
}

//get all tag info
Blog.getAllTag = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pipeline = [
                {$unwind: "$tags"},
                {
                    $group: {
                        _id: "$tags.tag",
                        count: {$sum: 1},
                        tags: {$push: "$$ROOT"}
                    }
                },
                {$sort: {_id: 1}}
            ];
            collection.aggregate(pipeline, function (err, results) {
                return callback(err, results);
            });
        });
    });
}

//get the blog by tag
Blog.getTagByTag = function (tag, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('blogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.find({
                "tags.tag": tag
            }).toArray(function (err, tags) {
                mongodb.close();
                if (err) {
                    callback(err, null, 0);
                } else {
                    callback(err, tags, tags.length);
                }
            });

        });
    });
}
