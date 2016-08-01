var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var path = require('path');
var setting = require('../../setting');
//
var User = require('../models/user.js');
var Blog = require('../models/blog.js');
var Idle = require('../models/idle.js');
var moment = require('moment');
var formidable = require('formidable');
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res) {
    return Blog.getTopBlog(function (err, blogs) {
        if (err) {
            console.log(err);
            blogs = [];
        }
        Idle.getTopIdle(function (err, idles) {
            if (err) {
                console.log(err);
                idles = [];
            }
            return res.render('index_left', {
                blogs: blogs,
                idles: idles,
                user: req.session.user
            });
        });
    });
});

/* the about page*/
router.get('/about', function (req, res) {
    res.render('./home/about');
});

router.get('/reg', function (req, res) {
    res.render('./sign/reg');
});

router.post("/reg", function (req, res) {
    //检验用户两次输入口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        console.log('两次输入的密码不一致');
        return res.redirect('/reg');
    }

    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
        name: req.body.username,
        password: password
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
        if (user) {
            err = 'Username already exists.';
        }
        if (err) {
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save(function (err) {
            if (err) {
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            return res.redirect('/');
        });

    });
});


/* the about page*/
router.get('/login', function (req, res) {
    res.render('./sign/login');
});

//登录验证
router.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username, function (err, user) {
        if (!user) {
            return res.redirect('/login');
        }
        if (user.password != password) {
            return res.redirect('/login');
        }
        req.session.user = user;
        res.redirect('/');
    });
});

//退出登录
router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/');
});

//管理
router.get('/manage', function (req, res) {
    Blog.getAll(function (err, blogs, count) {
        if (err) {
            blogs = [];
        }
        Idle.getAll(function (err, idles, count) {
            if (err) {
                console.log(err);
                idles = [];
            }
            return res.render('./home/manage', {
                blogs: blogs,
                idles: idles,
                user: req.session.user
            });
        });
    });
});

//新增文章
router.get('/blog/add', function (req, res) {
    return res.render('./blog/blogedit', {
        blog: new Blog({
            title: '',
            content: '',
            tags:''
        }),
        user: req.session.user,
        action: "addblog"
    });
});
router.post('/blog/add', function (req, res) {
    console.log(req.body);
    var blog = {
        title: req.body.title,
        content: req.body.content,
        tag: req.body.tag
    };
    Blog.save(blog, function (err, num, blog) {
        if (err && num === 0) {
            return res.json({
                success: false,
                successtype: 'saveblog'
            });
        }
        return res.redirect('/manage');
    });
});
//delete blog
router.get('/blog/delete', function (req, res) {
    var id;
    id = req.query.id;
    console.log(id + " router");
    return Blog.deleteById(id, function (err) {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                successtype: 'deleteblog'
            });
        } else {
            return res.json({
                success: true,
                successtype: 'deleteblog'
            });
        }
    });
});
//edit blog
router.get('/blog/edit/:id', function (req, res) {
    var id = req.params.id;
    Blog.findById(id, function (err, blog) {
        console.log(blog);
        return res.render('./blog/blogedit', {
            blog: blog,
            user: req.session.user,
            action: "editblog"
        });
    });
});
router.post('/blog/edit/:id', function (req, res) {
    var blog = {
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        tag: req.body.tag
    };
    Blog.updateBlog(blog, function (err, num, blog) {
        console.log(blog);
        if (err || num === 0) {
            return res.json({
                success: false
            });
        }
        return res.redirect('/manage');
    });
});

//
router.get('/blog', function (req, res) {
    //Blog.getAll(function (err, blogs, count) {
    //    if (err) {
    //        console.log(err);
    //        blogs = [];
    //    }
    //    return res.render('./blog/bloglist', {
    //        blogs: blogs,
    //        count: count
    //    });
    //});
    var page = req.query.page || 0;
    var pagenum = setting.perpagenum;
    var pageobj = {};
    pageobj.pagenum = pagenum;
    pageobj.page = page;
    Blog.getNextPage(pageobj, function (err, blogs, count) {
        if (err) {
            console.log(err);
            blogs = [];
        }
        var isLastPage;
        if (err) {
            return res.json({
                success: false,
                info: "fail to get MoreBlog!"
            });
        }
        isLastPage = (page * pagenum + blogs.length) === count;
        return res.render('./blog/bloglist', {
            blogs: blogs,
            count: count,
            isLastPage: isLastPage
        });
    });
});

//
router.get('/blog/:id', function (req, res) {
    var id = req.params.id;
    Blog.findById(id, function (err, blog) {
        console.log(blog);
        return res.render('./blog/viewblog', {
            blog: blog,
            user: req.session.user
        });
    });
});
//
router.get('/settopblog', function (req, res) {
    var id = req.query.id;
    var istop = req.query.istop;
    Blog.setTopBlog(id, istop, function (err) {
        if (err) {
            return res.json({
                success: false
            });
        } else {
            return res.json({
                success: true
            });
        }
    });
});
//分页
router.get('/nextpage', function (req, res) {
    var page = req.query.page;
    var last_date = req.query.last_date;
    var pagenum = setting.perpagenum;
    var pageobj = {};
    pageobj.pagenum = pagenum;
    pageobj.page = page;
    pageobj.last_date = last_date;
    Blog.getNextPage(pageobj, function (err, blogs, count) {
        var isLastPage;
        if (err) {
            return res.json({
                success: false,
                info: "fail to get MoreBlog!"
            });
        }
        isLastPage = (page * pagenum + blogs.length) === count;
        return res.json({
            total: count,
            success: true,
            blogs: blogs,
            isLastPage: isLastPage
        });
    });
});

//view 
router.get('/view', function (req, res) {
    Blog.getViewInfo(function (err, results) {
        console.log("view results = ", results);
        return res.render('./blog/view', {
            views: results,
            user: req.session.user
        });
    });
});

//preview
router.get('/cancel', function (req, res) {
    var type = req.query.type;
    console.log("test  ===  " + blog);
    return res.redirect('/manage');
});

//small talk
router.get('/idle/add', function (req, res) {
    return res.render('./idle/idleedit', {
        idle: new Idle({
            title: '',
            content: '',
            tags: '',
            quote:''
        }),
        user: req.session.user,
        action: "addidle"
    });
});
router.post('/idle/add', function (req, res) {
    console.log(req.body);
    var idle = {
        title: req.body.title,
        content: req.body.content,
        back_img : req.body.back_img,
        quote : req.body.quote,
        tag: req.body.tag
    };
    Idle.save(idle, function (err, num, idle) {
        if (err && num === 0) {
            return res.json({
                success: false,
                successtype: 'saveidle'
            });
        }
        console.log('发表成功');
        return res.redirect('/manage');
    });
});
//delete idle
router.get('/idle/delete', function (req, res) {
    var id = req.query.id;
    console.log(id + " router");
    return Idle.deleteById(id, function (err) {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                successtype: 'deleteidle'
            });
        } else {
            return res.json({
                success: true,
                successtype: 'deleteidle'
            });
        }
    });
});
//edit idle
router.get('/idle/edit/:id', function (req, res) {
    var id = req.params.id;
    Idle.findById(id, function (err, idle) {
        console.log(idle);
        return res.render('./idle/idleedit', {
            idle: idle,
            user: req.session.user,
            action: "editidle"
        });
    });
});
router.post('/idle/edit/:id', function (req, res) {
    var idle = {
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        back_img : req.body.back_img,
        quote : req.body.quote,
        tag: req.body.tag,
    };
    Idle.updateIdle(idle, function (err, num, idle) {
        console.log(idle);
        if (err || num === 0) {
            return res.json({
                success: false
            });
        }
        return res.redirect('/manage');
    });
});

//
router.get('/idle/:id', function (req, res) {
    var id = req.params.id;
    Idle.findById(id, function (err, idle) {
        console.log(idle);
        return res.render('./idle/viewidle', {
            idle: idle,
            user: req.session.user
        });
    });
});
//
router.get('/settopidle', function (req, res) {
    var id = req.query.id;
    var istop = req.query.istop;
    console.log(id + " router " + istop);
    Idle.setTopIdle(id, istop, function (err) {
        if (err) {
            console.log(err);
            return res.json({
                success: false,
                successtype: 'settopidle'
            });
        } else {
            return res.json({
                success: true,
                successtype: 'settopidle'
            });
        }
    });
});

//
router.get('/idle', function (req, res) {
    Idle.getViewInfo(function (err, results) {
        console.log("idles idles = ", results);
        return res.render('./idle/idle', {
            idles: results,
            user: req.session.user
        });
    });
});

//
router.post('/postImg', function (req, res) {
    var form, postFrom;
    var dateFile = moment().format('YYYYMMDD');
    var dirpath = 'app/upload/' + dateFile;
    //显示图片的路径
    var showpath = 'upload/' + dateFile;
    var folder_exists = fs.existsSync(dirpath);
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split('/').forEach(function (dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp)) {
                    return false;
                }
            }
        });
    }
    var tmpDir = "tmp_upload";
    if (!fs.existsSync(tmpDir)) {
        var pathTmp;
        tmpDir.split('/').forEach(function (tmpdir) {
            if (pathTmp) {
                pathTmp = path.join(pathTmp, tmpdir);
            }
            else {
                pathTmp = tmpdir;
            }
            if (!fs.existsSync(pathTmp)) {
                if (!fs.mkdirSync(pathTmp)) {
                    return false;
                }
            }
        });
    }
    form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = tmpDir;
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.keepAlive = true;
    if (req.path === '/post') {
        postFrom = 'blog';
    } else {
        postFrom = 'idle';
    }

    return form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
            throw  err;
        }
        var extName, img, name;
        if (err) {
            res.json({
                success: false
            });
            return;
        }
        extName = '';
        console.log(files);
        var allImg = [];
        for (var key in files) {
            var tmpImg = files[key];
            switch (tmpImg.type) {
                case 'image/pjpeg':
                    extName = 'jpg';
                    break;
                case 'image/jpeg':
                    extName = 'jpg';
                    break;
                case 'image/png':
                    extName = 'png';
                    break;
                case 'image/x-png':
                    extName = 'png';
            }
            if (extName.length == 0) {
                res.locals.error = '只支持png和jpg格式图片';
                return;
            }
            console.log(extName);
            if (extName.length === 0) {
                res.json({
                    success: false
                });
                return;
            }

            name = 'upload_' + allImg.length + moment().format('YYYYMMDDHHmmss') + '.' + extName;
            var newPath = dirpath + '/' + name;
            fs.renameSync(tmpImg.path, newPath);  //重命名
            var showUrl = showpath + '/' + name;
            var path = {
                original: showUrl,
                px200: showUrl + "-px200",
                px600: showUrl + "-px600",
                px1366: showUrl + "-px1366"
            }
            allImg[allImg.length] = path;
        }
        console.log(allImg);
        return res.json({
            success: true,
            form: postFrom,
            path: allImg
        });
    });
});

//
router.get('/tag', function (req, res) {
    Blog.getAllTag(function (err, results) {
        console.log("tags = ", results);
        return res.render('./tag/tag', {
            tags: results,
            user: req.session.user
        });
    });
});

//
router.get('/tag/:tag', function (req, res) {
    var tag = req.params.tag;
    Blog.getTagByTag(tag,function (err, results,count) {
        console.log("results results = ", results);
        return res.render('./tag/tagview', {
            tags: results,
            count:count,
            title:tag,
            user: req.session.user
        });
    });
});


module.exports = router;