var waterFall = (function(){
    function init(){
        waterFall();
        $(window).resize(function(){
            waterFall()
        });
        function waterFall() {
            var items = $('.item');
            var cols = parseInt($('.waterfall').outerWidth(true) / items.outerWidth(true)); //算出当前列数
            var itemArr = [];
            for (var i = 0; i < cols; i++) {
                itemArr[i] = 0; //先将值初始化为0
            }

            items.each(function () {
                var min = Math.min.apply(null, itemArr); // 找到最小值
                var minIndex = itemArr.indexOf(min);
                $(this).css({
                    top: itemArr[minIndex],
                    left: $(this).outerWidth(true) * minIndex
                });

                itemArr[minIndex] += $(this).outerHeight(true);
            })
        }
    }
    return{
        init: init
    }
})();
waterFall.init();