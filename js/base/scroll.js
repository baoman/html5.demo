(function () {

    window.onload = function () {
        //$('#loading').hide();
        layer();
        //回顶部
        $("#top").on("tap", function () {
            pageIndex = 1;
            $(".page-1").addClass('page-current').removeClass("f-hide").siblings().removeClass("page-current").addClass("hide");
            $(".page-1").find("img").removeClass("hide");
        });
    }
    var pageIndex = 1,
        pageTotal = $('.m-page').length,
        towards = {up: 1, right: 2, down: 3, left: 4},
        isAnimating = false;

//禁用手机默认的触屏滚动行为
    document.addEventListener('touchmove', function (event) {
        event.preventDefault();
    }, false);

    $(document).swipeUp(function () {
        if (isAnimating) return;
        if (pageIndex < pageTotal) {
            pageIndex += 1;
        } else {
            pageIndex = 1;
        }
        ;
        pageMove(towards.up);
    })

    $(document).swipeDown(function () {
        if (isAnimating) return;
        if (pageIndex > 1) {
            pageIndex -= 1;
        }
        else {
            //pageIndex = pageTotal;
            return;//第一屏往上拖动 不做操作
        }
        pageMove(towards.down);
    })

    function pageMove(tw) {
        $(".flotation").css({"top": "100%", "opacity": 0});
        var lastPage;
        if (tw == '1') {
            if (pageIndex == 1) {
                lastPage = ".page-" + pageTotal;
            } else {
                lastPage = ".page-" + (pageIndex - 1);
            }

        } else if (tw == '3') {
            if (pageIndex == pageTotal) {
                lastPage = ".page-1";
            } else {
                lastPage = ".page-" + (pageIndex + 1);
            }

        }

        var nowPage = ".page-" + pageIndex;

        switch (tw) {
            case towards.up:
                outClass = 'pt-page-moveToTop';
                inClass = 'pt-page-moveFromBottom';
                break;
            case towards.down:
                outClass = 'pt-page-moveToBottom';
                inClass = 'pt-page-moveFromTop';
                break;
        }
        isAnimating = true;
        $(nowPage).removeClass("f-hide");

        $(lastPage).addClass(outClass);
        $(nowPage).addClass(inClass);

        setTimeout(function () {
            $(lastPage).removeClass('page-current');
            $(lastPage).removeClass(outClass);
            $(lastPage).addClass("f-hide");
            $(lastPage).find("img").addClass("f-hide");

            $(nowPage).addClass('page-current');
            $(nowPage).removeClass(inClass);
            $(nowPage).find("img").removeClass("f-hide");
            layer();
            isAnimating = false;
        }, 600);

    }

    function layer() {
        var closeFlag = false;
        var $btn = $(".managebtn");
        if ($(".page-current").hasClass("page-1")) {//第一页
            $btn.find(".top").hide();
            $btn.css({
                "height": "170px",
                "margin-top": "-85px"
            });
        } else {
            $btn.find(".top").show();
            $btn.css({
                "height": "220px",
                "margin-top": "-110px"
            });
        }
        $(".close").on("tap", function () {
            $btn.css({"margin-right": "-90px", "-webkit-animation": "leftToRight 1s linear 1"});
            closeFlag = true;
        });
        window.setInterval(function () {
            if (closeFlag) {
                $btn.css({"margin-right": 0, "-webkit-animation": "RightToLeft 1s linear 1"});
                closeFlag = false;
            }
        }, 8000);
    }

})();