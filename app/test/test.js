var express = require('express');
var path = require('path');
var Blog = require('../models/blog.js');
var formidable = require('formidable');
var fs = require('fs');

var page = '1';
var pagenum = 1;
var pageobj = {};
pageobj.pagenum = pagenum;
pageobj.page = page;
pageobj.last_date = "2016-06-27 10:13:09";
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