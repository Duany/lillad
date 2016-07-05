/**
 * blog operation
 */

$('.delete').click(function () {
    if (confirm("Are you sure to Delete?")) {
        var id = $(this).data('id');
        var thisblog = $(this).parent().parent().parent();
        if ($(this).data('cmd') == "blog") {
            remove('/blog/delete', id, thisblog);
        }
        if ($(this).data('cmd') == "idle") {
            remove('/idle/delete', id, thisblog);
        }
    }
});

function remove(url, id, node) {
    $.ajax({
        type: 'get',
        url: url,
        data: {
            id: id
        },
        dataType: 'json',
        success: function (data, status, jqxhr) {
            if (data.success == true) {
                node.fadeOut(500);
            } else {
                alert("Fail！");
            }

        }

    });
}

//preview the info
function changeMd2Html(element) {
    var url = $(element).data('url');
    var input = $('#textareacontent').val();
    //markdown change to html
    var afterInput = markdown.toHTML(input);
    var preobj = {};
    preobj.title = $('#title').val();
    preobj.body = afterInput;
    var type = 'get';
    BaseSrv.callAjax(url, preobj,type, preViewCallBack, null);
}

function preViewCallBack(obj) {
    console.log(obj);
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
    //data.node = node;
    BaseSrv.callAjax(url, data, type, showResult, null);
}

function showResult(obj) {
    if (obj.data.istop === 'Y') {
        obj.data.node.html('<i class="fa fa-arrow-down"></i>');
    } else {
        obj.data.node.html('<i class="fa fa-arrow-up"></i>');
    }
    obj.data.node.data("istop", obj.data.istop);
}

$(".gettopidle").click(function () {
    var id = $(this).data('id');
    var node = $(this);
    var istop;

    istop = $(this).data("istop");

    url = '/settopidle'
    dotop(id, istop, node, url);
});

function dotop(id, istop, node, url) {
    $.ajax({
        type: 'get',
        url: url,
        data: {
            id: id,
            istop: istop
        },
        dataType: 'json',
        success: function (data, status, jqxhr) {
            if (data.success == true) {
                if (istop === 'Y') {
                    node.html('<i class="fa fa-arrow-down"></i>');
                } else {
                    node.html('<i class="fa fa-arrow-up"></i>');
                }
                node.data("istop", istop);
            } else {
                alert("Fail！");
            }

        }

    });
}