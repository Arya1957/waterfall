/*
jsonp 接口参数： https://platform.sina.com.cn/slide/album_tech?jsoncallback=func&app_key=1271687855&num=3&page=4

思路：
1. 获取数据
2. 生成DOM节点，通过瀑布流的方式将节点放到页面上
3. 当页面滚到底的时候，回到第一步
注意点：
1. 当图片加载完之后再去获取每个item的高度，否则的话计算的高度不准确
2.
 */

var count = 9;
var curPage = 1;
var nodeWidth = $('.item').outerWidth(true);
var colSumHeight = [];
var isDataArrive = true;  // 状态锁
var cols = parseInt($('.ct').width() / nodeWidth);

for (var i = 0; i < cols; i++) {
    colSumHeight[i] = 0;  // 初始化数组
}

$(window).scroll(function () {
    if (isVisible($('#load')) && isDataArrive) {
        //  如果load节点出现，并且数据已经到来，就开始加载
        start();
        //console.log(1)
    }
});


start();

function start() {
    getNews(function (newsList) {
        $(newsList).each(function (idx, news) {
            var $node = getNode(news);  // 为每条新闻数据生成DOM节点
            $node.find('img').on('load', function () {
                $('.waterfall').append($node);
                waterFall($node)  // 当图片加载完之后再把上面生成的DOM节点按照瀑布流的方式放到页面上(图片预加载）
            });
        })
    })
}


function getNews(callback) {

    if (!isDataArrive) return;
    isDataArrive = false;
    $.ajax({
        url: 'https://platform.sina.com.cn/slide/album_tech',
        dataType: 'jsonp',
        jsonp: "jsoncallback",
        data: {
            app_key: '1271687855',
            num: count,  // 约定每次要多少条数据
            page: curPage  // 当前是第几页
        }
    }).done(function (ret) {
        if (ret && ret.status && ret.status.code === '0') {
            callback(ret.data);  // 数据到来后生成节点，并摆放好位置
            console.log(ret.data);
            curPage++;
        } else {
            alert('获取数据失败')
        }
        isDataArrive = true
    }).fail(function () {
        alert('系统出错');
        isDataArrive = true
    })
}


function getNode(news) {
    var html = '';
    html += '<li class="item">';
    html += '<a href="' + news.url + ' ">';
    html += '<img src="' + news.img_url + '" alt="">';
    html += '<h4 class="title">' + news.short_name + '</h4>';
    html += '<p class="desc">' + news.short_intro + '</p>';
    html += '</a>';
    html += '</li>';
    return $(html)
}


function waterFall($node) {
    var minSumHeight = Math.min.apply(null,colSumHeight);
    var idx = colSumHeight.indexOf(minSumHeight);
    /*   找到当前高度最小的那一列
    var idx = 0;
    var minSumHeight = colSumHeight[0];
    for (var i = 0; i < colSumHeight.length; i++) {
        if (colSumHeight[i] < minSumHeight) {
            idx = i;
            minSumHeight = colSumHeight[i]
        }
    }
    */
    $node.css({
        left: idx * nodeWidth,
        top: minSumHeight
    });
    colSumHeight[idx] += $node.outerHeight(true);
    $('.waterfall').height(Math.max.apply(null, colSumHeight))  // 由于Li 都是绝对定位，脱离了文档流，此时父容器没有撑开，load节点永远都是可见的，所以必须给父容器设置一个高度
}


function isVisible(node) {
    var windowHeight = $(window).height();
    var scrollTop = $(window).scrollTop();
    var nodePosition = node.offset().top;
    if (nodePosition <= scrollTop + windowHeight + 500) {
        return true;  // 提前加载
    } else {
        return false;
    }
}


