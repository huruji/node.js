$(document).ready(function () {
        $.ajax({
            url: '/order/mine/api',       //请求的url地址，这是相对于现在的位置的地址
            dataType: 'json',             //返回格式为json
            async: true,                  //请求是否异步，默认为异步，这也是ajax重要特性
            data: {},                     //参数值
            type: 'GET',                  //请求方式
            beforeSend: function () {      //请求前的处理

            },
            success: function (response) {      //请求成功时处理
                var errMsg = '请求失败';

                if (response) {
                    if (response.code == 0 && response.dishes && response.dishes.length > 0) {
                        var totalPrice = 0;

                        for (var i = 0; i < response.dishes.length; i++) {
                            var item = response.dishes[i];
                            totalPrice += (item.price * item.count);

                            $('#dishes').append("<div style='font-size: 14px; color: #c72323; margin-top: 5px; margin-bottom: 5px'>" + item.count + "个" + item.name + "</div>");
                        }

                        $('#totalPrice').html(totalPrice);

                        return;
                    }

                    if (response.message) {
                        errMsg = response.message;
                    }
                }

                layer.alert(errMsg, {
                    skin: 'layui-layer-molv',  //样式类名
                    closeBtn: 0,
                    shift: 2 //动画类型
                });
            },
            error: function () {          //请求出错处理
                layer.alert('请求失败，请重试！', {
                    skin: 'layui-layer-molv',  //样式类名
                    closeBtn: 0,
                    shift: 2 //动画类型
                });
            },
            complete: function () {       //请求完成的处理

            }
        });
    });