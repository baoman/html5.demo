/**
 *  全局函数处理
 *
 *********************************************************************************************/
var car2 = {
    /****************************************************************************************************/
    /*  对象私有变量/函数返回值/通用处理函数
     *****************************************************************************************************/
    /*************************
     *  = 对象变量，判断函数
     *************************/
    _events: {},									// 自定义事件---this._execEvent('scrollStart');
    _windowHeight: $(window).height(),					// 设备屏幕高度
    _windowWidth: $(window).width(),

    _rotateNode: $('.p-ct'),							// 旋转体

    _page: $('.m-page'),							// 模版页面切换的页面集合
    _pageNum: $('.m-page').size(),					// 模版页面的个数
    _pageNow: 0,									// 页面当前的index数
    _pageNext: null,									// 页面下一个的index数

    _touchStartValY: 0,									// 触摸开始获取的第一个值
    _touchDeltaY: 0,									// 滑动的距离

    _moveStart: true,									// 触摸移动是否开始
    _movePosition: null,									// 触摸移动的方向（上、下）
    _movePosition_c: null,									// 触摸移动的方向的控制
    _mouseDown: false,								// 判断鼠标是否按下
    _moveFirst: true,
    _moveInit: false,

    _firstChange: false,

    _map: $('.ylmap'),							// 地图DOM对象
    _mapValue: null,									// 地图打开时，存储最近打开的一个地图
    _mapIndex: null,									// 开启地图的坐标位置

    _audioNode: $('.u-audio'),						// 声音模块
    _audio: null,									// 声音对象
    _audio_val: true,									// 声音是否开启控制

    _elementStyle: document.createElement('div').style,	// css属性保存对象

    _UC: RegExp("Android").test(navigator.userAgent) && RegExp("UC").test(navigator.userAgent) ? true : false,
    _weixin: RegExp("MicroMessenger").test(navigator.userAgent) ? true : false,
    _iPhoen: RegExp("iPhone").test(navigator.userAgent) || RegExp("iPod").test(navigator.userAgent) || RegExp("iPad").test(navigator.userAgent) ? true : false,
    _Android: RegExp("Android").test(navigator.userAgent) ? true : false,
    _IsPC: function () {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    },

    /***********************
     *  = gobal通用函数
     ***********************/
    // 判断函数是否是null空值
    _isOwnEmpty: function (obj) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    },
    // 微信初始化函数
    _WXinit: function (callback) {
        if (typeof window.WeixinJSBridge == 'undefined' || typeof window.WeixinJSBridge.invoke == 'undefined') {
            setTimeout(function () {
                this.WXinit(callback);
            }, 200);
        } else {
            callback();
        }
    },
    // 地图自定义绑定事件
    mapAddEventHandler: function (obj, eventType, fn, option) {
        var fnHandler = fn;
        if (!car2._isOwnEmpty(option)) {
            fnHandler = function (e) {
                fn.call(this, option);  //继承监听函数,并传入参数以初始化;
            }
        }
        obj.each(function () {
            $(this).on(eventType, fnHandler);
        })
    },
    //点击地图按钮显示地图
    mapShow: function (option) {
        // 获取各自地图的资源信息
        var str_data = $(this).attr('data-detal');
        option.detal = str_data != '' ? eval('(' + str_data + ')') : '';
        option.latitude = $(this).attr('data-latitude');
        option.longitude = $(this).attr('data-longitude');

        // 地图添加
        var detal = option.detal,
            latitude = option.latitude,
            longitude = option.longitude,
            fnOpen = option.fnOpen,
            fnClose = option.fnClose;

        car2._scrollStop();
        car2._map.addClass('show');
        $(document.body).animate({scrollTop: 0}, 0);

        //判断开启地图的位置是否是当前的
        if ($(this).attr('data-mapIndex') != car2._mapIndex) {
            car2._map.html($('<div class="bk"><span class="css_sprite01 s-bg-map-logo"></span></div>'));
            car2._mapValue = false;
            car2._mapIndex = $(this).attr('data-mapIndex');

        } else {
            car2._mapValue = true;
        }

        setTimeout(function () {
            //将地图显示出来
            if (car2._map.find('div').length >= 1) {
                car2._map.addClass("mapOpen");
                car2.page_stop();
                car2._scrollStop();
                car2._audioNode.addClass('z-low');
                // 设置层级关系-z-index
                car2._page.eq(car2._pageNow).css('z-index', 15);

                setTimeout(function () {
                    //如果开启地图的位置不一样则，创建新的地图
                    if (!car2._mapValue) car2.addMap(detal, latitude, longitude, fnOpen, fnClose);
                }, 500)
            } else return;
        }, 100)
    },

    //地图关闭，将里面的内容清空（优化DON结构）
    mapSave: function () {
        $(window).on('webkitTransitionEnd transitionend', mapClose);
        car2.page_start();
        car2._scrollStart();
        car2._map.removeClass("mapOpen");
        car2._audioNode.removeClass('z-low');

        if (!car2._mapValue) car2._mapValue = true;

        function mapClose() {
            car2._map.removeClass('show');
            // 设置层级关系-z-index
            car2._page.eq(car2._pageNow).css('z-index', 9);
            $(window).off('webkitTransitionEnd transitionend');
        }
    },

    //地图函数传值，创建地图
    addMap: function (detal, latitude, longitude, fnOpen, fnClose) {
        var detal = detal,
            latitude = Number(latitude),
            longitude = Number(longitude);

        var fnOpen = typeof(fnOpen) === 'function' ? fnOpen : '',
            fnClose = typeof(fnClose) === 'function' ? fnClose : '';

        //默认值设定
        var a = {sign_name: '', contact_tel: '', address: '天安门'};

        //检测传值是否为空，设置传值
        car2._isOwnEmpty(detal) ? detal = a : detal = detal;
        !latitude ? latitude = 39.915 : latitude = latitude;
        !longitude ? longitude = 116.404 : longitude = longitude;

        //创建地图
        car2._map.ylmap({
            /*参数传递，默认为天安门坐标*/
            //需要执行的函数（回调）
            detal: detal,		//地址值
            latitude: latitude,		//纬度
            longitude: longitude,	//经度
            fnOpen: fnOpen,		//回调函数，地图开启前
            fnClose: fnClose		//回调函数，地图关闭后
        });
    },

    //绑定地图出现函数
    mapCreate: function () {
        if ('.j-map'.length <= 0) return;

        var node = $('.j-map');

        //option地图函数的参数
        var option = {
            fnOpen: car2._scrollStop,
            fnClose: car2.mapSave
        };
        car2.mapAddEventHandler(node, 'click', car2.mapShow, option);
    },

    /**
     *  media资源管理
     *  -->绑定声音控制事件
     *  -->函数处理声音的开启和关闭
     *  -->异步加载声音插件（延迟做）
     *  -->声音初始化
     *  -->视频初始化
     *  -->声音和视频切换的控制
     */
    // 声音初始化
    audio_init: function () {
        // media资源的加载
        var options_audio = {
            loop: true,
            preload: "auto",
            src: car2._audioNode.attr('data-src')
        }

        car2._audio = new Audio();

        for (var key in options_audio) {
            if (options_audio.hasOwnProperty(key) && (key in car2._audio)) {
                car2._audio[key] = options_audio[key];
            }
        }
        car2._audio.load();
    },

    // 声音事件绑定
    audio_addEvent: function () {
        if (car2._audioNode.length <= 0) return;
        car2.audio_contorl();
        // 声音按钮点击事件
        var txt = car2._audioNode.find('.txt_audio'),
            time_txt = null;
        car2._audioNode.find('.btn_audio').on('tap', car2.audio_contorl);

        // 声音打开事件
        $(car2._audio).on('play', function () {
            car2._audio_val = false;

            audio_txt(txt, true, time_txt);

            // 开启音符冒泡
            $.fn.coffee.start();
            $('.coffee-steam-box').show(500);
        })

        // 声音关闭事件
        $(car2._audio).on('pause', function () {
            audio_txt(txt, false, time_txt)

            // 关闭音符冒泡
            $.fn.coffee.stop();
            $('.coffee-steam-box').hide(500);
        })

        function audio_txt(txt, val, time_txt) {
            if (val) txt.text('打开');
            else txt.text('关闭');

            if (time_txt) clearTimeout(time_txt);

            txt.removeClass('z-move z-hide');
            time_txt = setTimeout(function () {
                txt.addClass('z-move').addClass('z-hide');
            }, 1000);
        }
    },

    // 声音控制函数
    audio_contorl: function () {
        if (!car2._audio_val) {
            car2.audio_stop();
        } else {
            car2.audio_play();
        }
    },

    // 声音播放
    audio_play: function () {
        car2._audio_val = false;
        if (car2._audio) car2._audio.play();
    },

    // 声音停止
    audio_stop: function () {
        car2._audio_val = true;
        if (car2._audio) car2._audio.pause();
    },


    //处理声音和动画的切换
    media_control: function () {
        if (!car2._audio) return;
        if ($('video').length <= 0) return;

        $(car2._audio).on('play', function () {
            $('video').each(function () {
                if (!this.paused) {
                    this.pause();
                }
            });
        });

        $('video').on('play', function () {
            if (!car2._audio_val) {
                car2.audio_contorl();
            }
        });
    },

    // media管理初始化
    media_init: function () {
        // 声音初始化
        car2.audio_init();

        // 绑定音乐加载事件
        car2.audio_addEvent();

        // 音频切换
        car2.media_control();
    },
    // 微信的分享提示
    wxShare: function () {
        $('body').on('click', '.bigTxt-btn-wx', function () {
            var img_wx = $(this).parent().find('.bigTxt-weixin');

            img_wx.addClass('z-show');
            car2.page_stop();

            img_wx.on('click', function () {
                $(this).removeClass('z-show');
                car2.page_start();

                $(this).off('click');
            })
        })
    }(),

    /**************************************************************************************************************/
    /*  函数初始化
     ***************************************************************************************************************/
    /**
     *  相关插件的启动
     */
    //插件启动函数
    plugin: function () {
        // 地图
        car2.mapCreate();

        // 音符飘逸
        $('#coffee_flow').coffee({
            steams: ["<img src='images/audio_widget_01@2x.png' />", "<img src='images/audio_widget_01@2x.png' />"],
            steamHeight: 100,
            steamWidth: 44
        });

        // 微信分享
        var option_wx = {};

        if ($('#r-wx-title').val() != '') option_wx.title = $('#r-wx-title').val();
        if ($('#r-wx-img').val() != '') option_wx.img = $('#r-wx-img').val();
        if ($('#r-wx-con').val() != '') option_wx.con = $('#r-wx-con').val();

        if (car2._weixin) $(document.body).wx(option_wx);
    },
    // 图片预加载
    preLoadImg: function () {
        var imgarr = new Array();
        imgarr[0] = "/demo/images/pic-bg.jpg";
        imgarr[1] = "/demo/images/pic1.jpg";
        imgarr[2] = "/demo/images/pic2.jpg";
        imgarr[3] = "/demo/images/pic3.jpg";
        imgarr[4] = "/demo/images/pic4.jpg";
        imgarr[5] = "/demo/images/pic5.jpg";
        imgarr[6] = "/demo/images/pic6.jpg";
        imgarr[7] = "/demo/images/pic7.jpg";
        for (var i = 0; i < imgarr.length - 1; i++) {
            var img = new Image();
            img.src = imgarr[i];
        }
    },
    // 对象初始化
    init: function () {
        // loading执行一次
        var loading_time = new Date().getTime();
        $(window).on('load', function () {
            car2.preLoadImg();
            var now = new Date().getTime();
            var loading_end = false;
            var time;
            var time_del = now - loading_time;

            if (time_del >= 500) {
                loading_end = true;
            }

            if (loading_end) {
                time = 0;
            } else {
                time = 500 - time_del;
            }
            // loading完成后请求
            setTimeout(function () {
                setTimeout(function () {
                    $('#load').addClass('hide');
                    $('#pageload').removeClass('hide');
                }, 1000);

                // media初始化
                car2.media_init();
                // 插件加载
                car2.plugin();
                var _height = $(window).height();
                $("#pageload").height(_height);
                $('.p-ct').height(_height);
                $('.page').height(_height);
            }, time);
        });
    }
};

/*初始化对象函数*/
car2.init();


