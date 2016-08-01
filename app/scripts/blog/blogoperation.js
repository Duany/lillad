/**
 * blog operation
 */

function deleteInfo(element) {
    if (confirm("Are you sure to Delete?")) {
        var id = $(element).data('id');
        var thisblog = $(element).parent().parent().parent();
        var url;
        if ($(element).data('cmd') == "blog") {
            url = '/blog/delete';
        }
        if ($(element).data('cmd') == "idle") {
            url = '/idle/delete';
        }
        var url = $(element).data("url");
        var type = 'get';
        var data = {};
        data.id = id;
        data.node = thisblog;
        BaseSrv.callAjax(url, data, type, remove, null);
    }
}

function remove(obj) {
    obj.node.fadeOut(500);
}

//preview the info
function changeMd2Html(element) {
    var type = $(element).data('type');
    if (type === 'blog') {
        showBlog(true);
        var input = $('#textareacontent').val();
        //markdown change to html
        var afterInput = markdown.toHTML(input);
        $('#preblogtitle').html($('#title').val());
        $('#preblogcontent').html(afterInput);
    } else if (type === 'idle') {
        showIdle(true);
        var outp = $('#textareacontent').val();
        //markdown change to html
        var afterInput = markdown.toHTML(outp);
        $('#pretitle').html($('#title').val());
        $('#prequote').html($('#quote').val());
        $('#precontent').html(afterInput);
        var imgsrc = $('#inputbackgroudImg').val();
        if (imgsrc) {
            $('.background').css("background-image", "url('" + imgsrc + "')").css("background-size", "cover");
        }
    }
}
//preview blog
function showBlog(flag) {
    if (flag) {
        $('#diveditblog').hide();
        $('.footer').hide();
        $('#divpreblog').show();
    } else {
        $('#diveditblog').show();
        $('.footer').show();
        $('#divpreblog').hide();
    }
}
//preview small talk
function showIdle(flag) {
    if (flag) {
        $('#diveditidle').hide();
        $('.footer').hide();
        $('#divpreidle').show();
        var win_height;
        win_height = $(window).height();
        if (win_height < 450) {
            $('.background').height(450);
        } else {
            $('.background').height(win_height);
        }
    } else {
        $('#diveditidle').show();
        $('.footer').show();
        $('#divpreidle').hide();
    }
}

function cancelsave(element) {
    var url = $(element).data('url');
    var type = 'get';
    var data = {};
    data.url = id;
    data.type = 'blog';
    BaseSrv.callAjax(url, data, type, null, null);
}


function setToTop(element) {
    var id = $(element).data('id');
    var node = $(element);
    var istop = $(element).data("istop");
    var url = $(element).data("url");
    var type = 'get';
    var data = {};
    data.id = id;
    data.istop = istop;
    data.node = node;
    BaseSrv.callAjax(url, data, type, showResult, null);
}

function showResult(obj) {
    if (obj.data.istop === 'Y') {
        obj.node.html("<i class='fa fa-arrow-down'></i>");
    } else {
        obj.node.html("<i class='fa fa-arrow-up'></i>");
    }
    obj.node.data("istop", obj.data.istop);
}

function uploadImg(element) {
    var iMaxFilesize = 1048576; // 1MB
// get selected file element
    var oFiles = element.files;
    var type = $(element).data('type');

    // filter for image files
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;

    // 实例化一个表单数据对象
    var formData = new FormData();

    // 遍历图片文件列表，插入到表单数据中
    for (var i = 0; i < oFiles.length; i++) {
        var file = oFiles[i];
        if (!rFilter.test(file.type)) {
            return;
        }
        // little test for filesize
        if (file.size > iMaxFilesize) {
            return;
        }
        // 文件名称，文件对象
        formData.append(file.name, file);
    }

    // create XMLHttpRequest object, adding few event listeners, and POSTing our data
    var oXHR = new XMLHttpRequest();
    //2.设置回调函数
    oXHR.onreadystatechange = function () {
        loadFinish(this, type)
    };

    oXHR.open('POST', '/postImg', true);
    oXHR.send(formData);
}

//回调函数
function loadFinish(xhr, type) {
    if (xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr);
        var resJson = JSON.parse(xhr.response);
        if (resJson.success) {
            imgMKType(type, resJson.path);
        }
    }
}

//将图片按markdown的写法格式化
function imgMKType(type, imgList) {
    //原始字段信息
    var orgText = $('#textareacontent').val();
    for (var i in imgList) {
        var tmp = imgList[i];
        var url = tmp.original;
        var imgT;
        if (type === 'BgImg') {
            imgT = url;
            $('#inputbackgroudImg').val(imgT);
        } else {
            imgT = "![img](" + url + ')  ';
            orgText += imgT;
        }
    }
    $('#textareacontent').val(orgText);
}

function getNextPageBlog(element) {
    var $elem = $(element);
    var last_date = $elem.data('last_date');
    var page = $elem.data('page');
    var url = '/nextpage';
    var type = 'get';
    var data = {page: page, last_date: last_date};
    data.node = $elem;
    BaseSrv.callAjax(url, data, type, showNextPage, null);
}

function showNextPage(obj) {
    //
    if (obj.blogs.length > 0) {
        obj.node.data("page", obj.data.page + 1);
        obj.node.data("last_date", obj.blogs[obj.blogs.length - 1].createdate);
    }
    if (obj.isLastPage) {
        obj.node.hide();
    }
    for (var i = 0; i < obj.blogs.length; i++) {
        var blog = obj.blogs[i];
        //var html = "<div class=\"blog-each\"><h3><a href=\"/blog/" + data.blogs[i]._id.toString() + "\" class=\"blog-title\">" +
        //    data.blogs[i].title.toString() +
        //    "</a></h3><div class=\"blog-content\">" +
        //    data.blogs[i].contentBegin.toString() +
        //    "</div><div class=\"blog-content-footer\"><span>" +
        //    data.blogs[i].time.day + "</span></div></div>";

        var div = $("<div class='blog-detail'></div>");
        var h3 = $("<h3></h3>");
        var a = $("<a target='_blank' class='blog-title'></a>");
        a.attr("href", './blog/' + blog._id.toString());
        a.html(blog.title.toString());
        h3.append(a);
        var contDiv = $("<div class='blog-content'></div>");
        contDiv.html(blog.content.toString());
        var footDiv = $("<div class='blog-content-footer'></div>");
        var spanTime = $("<span></span>");
        spanTime.html(blog.time.day);
        footDiv.append(spanTime);
        var tara = $("<a target='_blank' class='pull-right'><i class='fa fa-tags'></i></a>");
        footDiv.append(tara);
        $("#divbloglist").append(div.append(h3).append(contDiv).append(footDiv)).fadeIn();
    }

}