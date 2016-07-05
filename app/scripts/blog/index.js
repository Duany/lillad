/**
 * Created by Duany on 2016/5/16.
 */
(function () {
    var idle;

    idle = function () {
        var win_height;
        win_height = $(window).height();
        if (win_height < 450) {
            $('.background').height(450);
        } else {
            $('.background').height(win_height);
        }
    };

    //$(document).ready(function(){ ......  })
    $(function () {
        $('#div-top').hide();
        idle();
        $(window).resize(function () {
            idle();
        });
    });

    //设置滚动高度显示菜单栏
    window.onscroll = function () {
        var t, win_height;
        t = document.documentElement.scrollTop || document.body.scrollTop;
        win_height = $(window).height();
        if (t > 50) {
            return $('#div-top').show();
        } else {
            return $('#div-top').hide();
        }
    };
}).call(this);