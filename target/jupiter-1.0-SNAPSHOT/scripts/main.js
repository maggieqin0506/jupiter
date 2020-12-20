;(function () {
    // get all elements
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oLoginBtn = document.getElementById('login-btn'),
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),
        oRegisterForm = document.getElementById('register-form'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),
        oFavBtn = document.getElementById('fav-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),
        oNavBtnBox = document.getElementsByClassName('main-nav')[0],
        oNavBtnList = document.getElementsByClassName('main-nav-btn'),
        oItemNav = document.getElementById('item-nav'),
        oItemList = document.getElementById('item-list'),
        oTpl = document.getElementById('tpl').innerHTML,

        // default data
        userId = '1111',
        userFullName = 'John',
        lng = -122.08,
        lat = 37.38,
        // lng = -122,
        // lat = 47,
        itemArr;

    // init
    function init() {
        // validate session: 看一下用户的状态，log int or not
        validateSession();
        // bind event: 给很多元素加event listener
        // 元素捆绑，相应
        bindEvent();
    }

    function validateSession() {
        switchLoginRegister('login');
    }

    function bindEvent() {
        // switch between login and register
        oRegisterFormBtn.addEventListener('click', function () {
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function () {
            switchLoginRegister('login')
        }, false);

        // click login button
        oLoginBtn.addEventListener('click', loginExecutor, false);

        // click register button
        oRegisterBtn.addEventListener('click', registerExecutor, false);
        oNearbyBtn.addEventListener('click', loadNearbyData, false);
        oFavBtn.addEventListener('click', loadFavoriteItems, false);
        oRecommendBtn.addEventListener('click', loadRecommendedItems, false);
        oItemList.addEventListener('click', changeFavoriteItem, false);
    }

    // 切换你的状态
    function switchLoginRegister(name) {
        // hide header elements
        showOrHideElement(oAvatar, 'none');
        showOrHideElement(oWelcomeMsg, 'none');
        showOrHideElement(oLogoutBtn, 'none');

        // hide item list area
        showOrHideElement(oItemNav, 'none');
        showOrHideElement(oItemList, 'none');

        if (name === 'login') {
            // hide register form
            showOrHideElement(oRegisterForm, 'none');
            // clear register error
            oRegisterResultField.innerHTML = ''

            // show login form
            showOrHideElement(oLoginForm, 'block');

        } else {
            // hide login form
            showOrHideElement(oLoginForm, 'none');
            // clear login error if existed
            oLoginErrorField.innerHTML = '';

            // show register form
            showOrHideElement(oRegisterForm, 'block');
        }
    }

    /**
     * API Login
     */
    function loginExecutor() {
        var username = oLoginUsername.value,
            password = oLoginPwd.value;

        if (username === "" || password == "") {
            oLoginErrorField.innerHTML = 'Please fill in all fields';
            return;
        }
        password = md5(username + md5(password));

        // info need for login
        ajax({
            method: 'POST',
            url: './login', // relative path is sufficient
            data: {
                // determine by servlet loginServlet
                user_id: username,
                password: password,
            },
            // res - JSON.parse(xhr.responseText)
            success: function (res) {
                // case1: login success
                if (res.status === 'OK') {
                    console.log('login')
                    console.log(res);
                    // show welcome message
                    welcomeMsg(res);
                    // fetch data
                    fetchData();
                } else {
                    // case2: login failed
                    oLoginErrorField.innerHTML = 'Invalid username or password';
                }
            },
            error: function () {
                //show login error
                throw new Error('Invalid username or password');
            }
        })
    }

    /**
     * API Change Favorite Item
     * @param evt
     */
    function changeFavoriteItem(evt) {
        var tar = evt.target,
            oParent = tar.parentElement;

        if (oParent && oParent.className === 'fav-link') {
            console.log('change ...')
            var oCurLi = oParent.parentElement,
                classname = tar.className,
                isFavorite = classname === 'fa fa-heart',
                oItems = oItemList.getElementsByClassName('item'),
                index = Array.prototype.indexOf.call(oItems, oCurLi),
                url = './history',
                req = {
                    user_id: userId,
                    favorite: itemArr[index]
                };
            var method = !isFavorite ? 'POST' : 'DELETE';

            ajax({
                method: method,
                url: url,
                data: req,
                success: function (res) {
                    if (res.status === 'OK' || res.result === 'SUCCESS') {
                        tar.className = !isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
                    } else {
                        throw new Error('Change Favorite failed!')
                    }
                },
                error: function () {
                    throw new Error('Change Favorite failed!')
                }
            })
        }
    }

    /**
     * API Register
     */
    function registerExecutor() {
        var username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;

        if (username === "" || password == "" || firstName === ""
            || lastName === "") {
            oRegisterResultField.innerHTML = 'Please fill in all fields';
            return;
        }

        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = 'Invalid username';
            return;
        }
        password = md5(username + md5(password));

        ajax({
            method: 'POST',
            url: './register',
            data: {
                user_id: username,
                password: password,
                first_name: firstName,
                last_name: lastName,
            },
            success: function (res) {
                if (res.status === 'OK' || res.result === 'OK') {
                    oRegisterResultField.innerHTML = 'Successfully registered!'
                } else {
                    oRegisterResultField.innerHTML = 'User already existed!'
                }
            },
            error: function () {
                //show login error
                throw new Error('Failed to register');
            }
        })
    }

    /**
     * API Load Nearby Items
     */
    function loadNearbyData() {
        // active side bar buttons
        activeBtn('nearby-btn');

        var opt = {
            method: 'GET',
            url: './search?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'nearby'
        }
        serverExecutor(opt);
    }

    /**
     * API Load Favorite Items
     */
    function loadFavoriteItems() {
        activeBtn('fav-btn');
        var opt = {
            method: 'GET',
            url: './history?user_id=' + userId,
            data: null,
            message: 'favorite'
        }
        serverExecutor(opt);
    }

    /**
     * API Load Recommended Items
     */
    function loadRecommendedItems() {
        activeBtn('recommend-btn');
        var opt = {
            method: 'GET',
            url: './recommendation?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'recommended'
        }
        serverExecutor(opt);
    }

    /**
     * Render Data
     * @param data
     */
    function render(data) {
        var len = data.length,
            list = '',
            item;
        // look at html, 和实际数据进行调换
        for (var i = 0; i < len; i++) {
            item = data[i];
            list += oTpl.replace(/{{(.*?)}}/gmi, function (node, key) {
                console.log(key)
                if (key === 'company_logo') {
                    return item[key] || 'https://via.placeholder.com/100';
                }
                if (key === 'location') {
                    return item[key].replace(/,/g, '<br/>').replace(/\"/g, '');
                }
                if (key === 'favorite') {
                    return item[key] ? "fa fa-heart" : "fa fa-heart-o";
                }
                return item[key];
            })
        }
        oItemList.innerHTML = list;
    }

    function activeBtn(btnId) {
        var len = oNavBtnList.length;
        for (var i = 0; i < len; i++) {
            oNavBtnList[i].className = 'main-nav-btn';
        }
        var btn = document.getElementById(btnId);
        btn.className += ' active';
    }

    /**
     * Fetch Geolocation
     * @param cb
     */

    // 拿你电脑里的信息，拿经纬度
    // 向后端要周边工作信息的时候，需要传一下自己的未知
    /**
     * Fetch Geolocation
     * @param cb
     */
    function initGeo(cb) {
        // 拿成功
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    // comment out the two lines below to use your location
                    // lat = position.coords.latitude || lat;
                    // lng = position.coords.longitude || lng;
                    cb();
                },
                function () { //拿的过程中失败
                    throw new Error('Geo location fetch failed!!')
                }, {
                    // cache the result, getCurrentPosition() is pretty expensive
                    // since it is fetching the geo location
                    maximumAge: 60000
                });
            oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
        } else {
            throw new Error('Your browser does not support navigator!!')
        }
    }


    function showOrHideElement(ele, style) {
        // 控制元素的显示或者隐藏
        ele.style.display = style;
    }

    function welcomeMsg(info) {
        userId = info.user_id || userId;
        userFullName = info.name || userFullName;
        oWelcomeMsg.innerHTML = 'Welcome ' + userFullName;

        // show welcome, avatar, item area, logout btn
        showOrHideElement(oWelcomeMsg, 'block');
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');

        // hide login form
        showOrHideElement(oLoginForm, 'none');
    }

    function fetchData() {
        // get geo-location info
        initGeo(loadNearbyData);
    }

    /**
     * Helper - AJAX
     * @param opt
     */

    function ajax(opt) {
        // 放哪些request 在option上
        // opt - 巨大的object, 下面的所有参数都打包在obj里面
        var opt = opt || {}, // opt == undefine ? opt : {}
            method = (opt.method || 'GET').toUpperCase(),
            url = opt.url,
            data = opt.data || null,
            success = opt.success || function () { // 成功后的应对方式
            },
            error = opt.error || function () { // 错误后的应对方式
            },
            xhr = new XMLHttpRequest();

        if (!url) {
            throw new Error('missing url');
        }

        xhr.open(method, url, true);

        // data是否是传进来的
        // async - call stack清空之后再执行下面的
        if (!data) {
            // async function, put into the queue
            // execute after the stack is clear
            // go to line 163
            xhr.send();
        } else {
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
            xhr.send(JSON.stringify(data));
        }

        //如果已经收到了，传输正常
        xhr.onload = function () {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText))
            } else {
                error()
            }
        }

        //请求的失败，如果没有收到，传输不正常
        xhr.onerror = function () {
            throw new Error('The request could not be completed.')
        }
    }


    /**
     * Helper - Get Data from Server
     */
    function serverExecutor(opt) {
        oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>Loading ' + opt.message + ' item...</p>';
        ajax({
            method: opt.method,
            url: opt.url,
            data: opt.data,
            success: function (res) {
                if (!res || res.length === 0) {
                    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No ' + opt.message + ' item!</p>';
                } else {
                    render(res);
                    itemArr = res;
                }
            },
            error: function () {
                throw new Error('No ' + opt.message + ' items!');
            }
        })
    }

    init();
})()