/**
 * [前后台通过JSON通信的模块]
 * Created by Duany on 2016/5/9.
 */
var service = (function () {
    var send = function (url, data,type, isSyn, success, error) {

        var node = data.node||null;
        delete data.node;
        var returnValue = $.ajax({
            type: type,
            contentType:"application/json",
            dataType: "json",
            data: data,
            async: !isSyn, //默认都是异步的方式
            url: url,
            success: function (obj) {
                obj.data = data;
                obj.node = node;
                if (obj.success) {
                    returnValue = success(obj);
                } else {
                    error(obj);

                }
            }
        });

        return returnValue;
    };
    return {
        /**
         * [异步方式执行后台服务]
         * @param  {[String]} url [服务名称]
         * @param  {[Object]} data        [服务对应的数据，JSON格式]
         * @param  {[Function]} success     [服务成功时候的回调]
         * @param  {[Function]} error       [服务失败时候的回调]
         * @return {[Object]}             [通过回调来调用服务，所以返回的值为null]
         */
        callAjax: function (url, data,type, success, error) {
            return send(url, data,type, false, success, error);
        }
    }
});

var BaseSrv = window.BaseSrv = new service();

