define(function(require) {
    var util = {};

    //兼容 transfer-dom.js中 使用了 dataset 的问题
    if (window.HTMLElement) {
        if (Object.getOwnPropertyNames(HTMLElement.prototype).indexOf('dataset') === -1) {
            Object.defineProperty(HTMLElement.prototype, 'dataset', {
                get: function() {
                    var attributes = this.attributes; //获取节点的所有属性
                    var name = [],
                        value = []; //定义两个数组保存属性名和属性值
                    var obj = {}; //定义一个空对象
                    for (var i = 0; i < attributes.length; i++) { //遍历节点的所有属性
                        if (attributes[i].nodeName.slice(0, 5) == 'data-') { //如果属性名的前面5个字符符合"data-"
                            // 取出属性名的"data-"的后面的字符串放入name数组中
                            name.push(attributes[i].nodeName.slice(5));
                            //取出对应的属性值放入value数组中
                            value.push(attributes[i].nodeValue);
                        }
                    }
                    for (var j = 0; j < name.length; j++) { //遍历name和value数组
                        obj[name[j]] = value[j]; //将属性名和属性值保存到obj中
                    }
                    return obj; //返回对象
                }
            });
        }
    }

    util.getVue = function(name) {
        var Vue = require('vue');
        var Vuex = require('vueX');
        var jquery = require('jquery');
        var VueResource = require('vueresource');
        Vue.use(Vuex);
        Vue.use(VueResource);
        //使用http json
        //Vue.http.options.emulateJSON = true;
        Vue.http.headers['Content-Type'] = 'application/json;charset=UTF-8';
        Vue.prototype.$jquery = jquery;
        Vue.prototype.$util = util;
        if (name && name == 'iview') {
            var iview = require('iview');
            Vue.use(iview);
        }

        //配置过滤器
        Vue.http.interceptors.push(function(request, next) {
            request.headers.set('AuthToken', (localStorage['AuthToken'] || ''));
            if (request.body.loading) {
                this.$Spin.show();
            }

            next(function(response) {
                if (request.body && JSON.parse(request.body).loading) {
                    this.$Spin.hide();
                }
                return response;
            });
        });
        return Vue;
    };

    util.iview = {};
    util.iview.validateEmpty = function(rule, value, callback, source, options) {
        if (!rule.required) {
            callback();
            return;
        }
        if (null == value || '' == value || undefined == value) {
            callback(new Error(rule.message));
        } else {
            callback();
        }
    }

    /**
     * [日期格式化方法]
     * @param  {[String]} fmt [需要格式化的时间]
     * @return {[String]}     [返回的时间格式]
     */
    Date.prototype.format = function(fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    /**
     * @description 增加一些日常js工具类===================================================
     */
    //===========check类  校验数据类型、数据合法性、浏览器信息=========================
    util.$checkObj = {
        _isString: function(o) { //是否字符串
            return Object.prototype.toString.call(o).slice(8, -1) === 'String'
        },
        _isNumber: function(o) { //是否数字
            return Object.prototype.toString.call(o).slice(8, -1) === 'Number'
        },
        _isObj: function(o) { //是否对象
            return Object.prototype.toString.call(o).slice(8, -1) === 'Object'
        },
        _isArray: function(o) { //是否数组
            return Object.prototype.toString.call(o).slice(8, -1) === 'Array'
        },
        _isDate: function(o) { //是否时间
            return Object.prototype.toString.call(o).slice(8, -1) === 'Date'
        },
        _isBoolean: function(o) { //是否boolean
            return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean'
        },
        _isFunction: function(o) { //是否函数
            return Object.prototype.toString.call(o).slice(8, -1) === 'Function'
        },
        _isNull: function(o) { //是否为null
            return Object.prototype.toString.call(o).slice(8, -1) === 'Null'
        },
        _isUndefined: function(o) { //是否undefined
            return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined'
        },
        _isFalse: function(o) {
            if (!o || o === 'null' || o === 'undefined' || o === 'false' || o === 'NaN') return true
            return false
        },
        _isTrue: function(o) {
            return !this._isFalse(o)
        },
        _isIos: function() {
            var u = navigator.userAgent;
            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) { //安卓手机
                // return "Android";
                return false
            } else if (u.indexOf('iPhone') > -1) { //苹果手机
                // return "iPhone";
                return true
            } else if (u.indexOf('iPad') > -1) { //iPad
                // return "iPad";
                return false
            } else if (u.indexOf('Windows Phone') > -1) { //winphone手机
                // return "Windows Phone";
                return false
            } else {
                return false
            }
        },
        _isPC: function() { //是否为PC端
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"
            ];
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        },
        /**
         * 检验数据是否合理
         * @param {Object} str 需要输入的数据
         * @param {Object} type 需要校验的类型
         * @author tj
         */
        _checkDataIsReasonable: function(str, type) {
            switch (type) {
                case 'phone': //手机号码
                    return /^1[3|4|5|6|7|8|9][0-9]{9}$/.test(str);
                case 'tel': //座机
                    return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);
                case 'card': //身份证
                    return /^\d{15}|\d{18}$/.test(str);
                case 'pwd': //密码以字母开头，长度在6~18之间，只能包含字母、数字和下划线
                    return /^[a-zA-Z]\w{5,17}$/.test(str)
                case 'postal': //邮政编码
                    return /[1-9]\d{5}(?!\d)/.test(str);
                case 'QQ': //QQ号
                    return /^[1-9][0-9]{4,9}$/.test(str);
                case 'email': //邮箱
                    return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str);
                case 'money': //金额(小数点2位)
                    return /^\d*(?:\.\d{0,2})?$/.test(str);
                case 'URL': //网址
                    return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(str)
                case 'IP': //IP
                    return /((?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d))/.test(str);
                case 'date': //日期时间
                    return /^(\d{4})\-(\d{2})\-(\d{2}) (\d{2})(?:\:\d{2}|:(\d{2}):(\d{2}))$/.test(str) || /^(\d{4})\-(\d{2})\-(\d{2})$/.test(str)
                case 'number': //数字
                    return /^[0-9]$/.test(str);
                case 'english': //英文
                    return /^[a-zA-Z]+$/.test(str);
                case 'chinese': //中文
                    return /^[\u4E00-\u9FA5]+$/.test(str);
                case 'lower': //小写
                    return /^[a-z]+$/.test(str);
                case 'upper': //大写
                    return /^[A-Z]+$/.test(str);
                case 'HTML': //HTML标记
                    return /<("[^"]*"|'[^']*'|[^'">])*>/.test(str);
                default:
                    return true;
            }
        },
        /*
            检测密码强度
        */
        _checkPwdLvel: function(str) {
            var Lv = 0;
            if (str.length < 6) {
                return Lv
            }
            if (/[0-9]/.test(str)) {
                Lv++
            }
            if (/[a-z]/.test(str)) {
                Lv++
            }
            if (/[A-Z]/.test(str)) {
                Lv++
            }
            if (/[\.|-|_]/.test(str)) {
                Lv++
            }
            return Lv;
        },
        _getBrowserType: function() {
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
            var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
            var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
            var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
            var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
            if (isIE) {
                var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
                reIE.test(userAgent);
                var fIEVersion = parseFloat(RegExp["$1"]);
                if (fIEVersion == 7) return "IE7"
                else if (fIEVersion == 8) return "IE8";
                else if (fIEVersion == 9) return "IE9";
                else if (fIEVersion == 10) return "IE10";
                else if (fIEVersion == 11) return "IE11";
                else return "IE7以下" //IE版本过低
            }
            if (isFF) return "Firefox";
            if (isOpera) return "Opera";
            if (isEdge) return "Edge";
            if (isSafari) return "Safari";
            if (isChrome) return "Chrome";
        }
    }
    //================增加数组原型操作方法===========================================
    util.$arrayObj = {
        /**
         * 数组中是否包含某元素
         * @param {Object} arr
         * @param {Object} val
         */
        _contains: function(arr, val) {
            return arr.indexOf(val) != -1 ? true : false;
        },
        /**
         * @param  {arr} 数组排序
         * @param  {type} asc,desc,random
         * @param isStrict 
         * @return {Array}
         */
        _sort: function(arr, type) {
            return arr.sort((a, b) => {
                switch (type) {
                    case 'asc':
                        return a - b;
                    case 'desc':
                        return b - a;
                    case 'random':
                        return Math.random() - 0.5;
                    default:
                        return arr;
                }
            })
        },
        /**
         * 数组去重
         * @param {Object} arr 传入的数组
         * @param {Object} isStrict 是否严格模式，非严格模式排重并不能区分 2 和 '2'，但能减少用indexOf带来的性能,暂时没找到替代的方法
         */
        _unique: function(arr, isStrict) {
            if (Array.hasOwnProperty('from')) {
                return Array.from(new Set(arr));
            } else {
                if (!isStrict) {
                    var n = {},
                        r = [];
                    for (var i = 0; i < arr.length; i++) {
                        if (!n[arr[i]]) {
                            n[arr[i]] = true;
                            r.push(arr[i]);
                        }
                    }
                    return r;
                } else {
                    var r = [],
                        NaNBol = true
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] !== arr[i]) {
                            if (NaNBol && r.indexOf(arr[i]) === -1) {
                                r.push(arr[i])
                                NaNBol = false
                            }
                        } else {
                            if (r.indexOf(arr[i]) === -1) r.push(arr[i])
                        }
                    }
                    return r
                }
            }
        },
        /**
         * 去重
         * @param {Object} arr
         * @param {Object} key
         */
        _distinct: function(arr, key) {
            var result = [],
                i,
                j,
                len = arr.length;
            for (i = 0; i < len; i++) {
                for (j = i + 1; j < len; j++) {
                    if (arr[i][key] === arr[j][key]) {
                        j = ++i;
                    }
                }
                result.push(arr[i]);
            }
            return result;
        },
        /**
         * 两个数组的并集，先连接再去重
         * @param {Object} a
         * @param {Object} b
         */
        _union: function(a, b) {
            var newArr = a.concat(b);
            return this._unique(newArr);
        },
        /**
         * @param  {arr} 数组
         * @param  {fn} 回调函数
         * @param  {thisObj} this指向
         * @return {Array} 
         */
        _map: function(arr, fn, thisObj) {
            var scope = thisObj || window;
            var a = [];
            for (var i = 0, j = arr.length; i < j; ++i) {
                var res = fn.call(scope, arr[i], i, this);
                if (res != null) a.push(res);
            }
            return a;
        },
        /*求两个集合的交集*/
        _intersect: function(a, b) {
            var _this = this;
            a = this._unique(a);
            return this._map(a, function(o) {
                return _this._contains(b, o) ? o : null;
            });
        },
        /*删除其中一个元素*/
        _remove: function(arr, ele) {
            var index = arr.indexOf(ele);
            if (index > -1) {
                arr.splice(index, 1);
            }
            return arr;
        },
        /*将类数组转换为数组的方法*/
        _formArray: function(ary) {
            var arr = [];
            if (Array.isArray(ary)) {
                arr = ary;
            } else {
                arr = Array.prototype.slice.call(ary);
            };
            return arr;
        },
        /*最大值*/
        _max: function(arr) {
            return Math.max.apply(null, arr);
        },
        /*最小值*/
        _min: function(arr) {
            return Math.min.apply(null, arr);
        },
        /*求和*/
        _sum: function(arr) {
            return arr.reduce((pre, cur) => {
                return pre + cur
            })
        },
        /*平均值*/
        _average: function(arr) {
            return this._sum(arr) / arr.length
        }
    }
    //字符串处理===============String类==================================
    util.$stringObj = {
        /**
         * 去除空格
         * @param  {str}
         * @param  {type}   type:  1-所有空格  2-前后空格  3-前空格 4-后空格
         * @return {String}
         */
        _trim: function(str, type) {
            type = type || 1
            switch (type) {
                case 1:
                    return str.replace(/\s+/g, "");
                case 2:
                    return str.replace(/(^\s*)|(\s*$)/g, "");
                case 3:
                    return str.replace(/(^\s*)/g, "");
                case 4:
                    return str.replace(/(\s*$)/g, "");
                default:
                    return str;
            }
        },
        /**
         * @param  {str} 
         * @param  {type}
         * type:  1:首字母大写  2：首页母小写  3：大小写转换  4：全部大写  5：全部小写
         * @return {String}
         */
        _changeCase: function(str, type) {
            type = type || 4
            switch (type) {
                case 1:
                    return str.replace(/\b\w+\b/g, function(word) {
                        return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();

                    });
                case 2:
                    return str.replace(/\b\w+\b/g, function(word) {
                        return word.substring(0, 1).toLowerCase() + word.substring(1).toUpperCase();
                    });
                case 3:
                    return str.split('').map(function(word) {
                        if (/[a-z]/.test(word)) {
                            return word.toUpperCase();
                        } else {
                            return word.toLowerCase()
                        }
                    }).join('')
                case 4:
                    return str.toUpperCase();
                case 5:
                    return str.toLowerCase();
                default:
                    return str;
            }
        },
        /*过滤html代码(把<>转换) */
        _filterTag: function(str) {
            str = str.replace(/&/ig, "&amp;");
            str = str.replace(/</ig, "&lt;");
            str = str.replace(/>/ig, "&gt;");
            str = str.replace(" ", "&nbsp;");
            return str;
        }
    }
    //=================Number类=====================================================
    util.$numberObj = {
        /*随机数范围*/
        _random: function(min, max) {
            if (arguments.length === 2) {
                return Math.floor(min + Math.random() * ((max + 1) - min))
            } else {
                return null;
            }
        },

        /*将阿拉伯数字翻译成中文的大写数字*/
        _numberToChinese: function(num) {
            var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十");
            var BB = new Array("", "十", "百", "仟", "萬", "億", "点", "");
            var a = ("" + num).replace(/(^0*)/g, "").split("."),
                k = 0,
                re = "";
            for (var i = a[0].length - 1; i >= 0; i--) {
                switch (k) {
                    case 0:
                        re = BB[7] + re;
                        break;
                    case 4:
                        if (!new RegExp("0{4}//d{" + (a[0].length - i - 1) + "}$")
                            .test(a[0]))
                            re = BB[4] + re;
                        break;
                    case 8:
                        re = BB[5] + re;
                        BB[7] = BB[5];
                        k = 0;
                        break;
                }
                if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
                    re = AA[0] + re;
                if (a[0].charAt(i) != 0)
                    re = AA[a[0].charAt(i)] + BB[k % 4] + re;
                k++;
            }
            if (a.length > 1) // 加上小数部分(如果有小数部分)
            {
                re += BB[6];
                for (var i = 0; i < a[1].length; i++)
                    re += AA[a[1].charAt(i)];
            }
            if (re == '一十')
                re = "十";
            if (re.match(/^一/) && re.length == 3)
                re = re.replace("一", "");
            return re;
        },
        /*将数字转换为大写金额*/
        _changeToChinese: function(Num) {
            //判断如果传递进来的不是字符的话转换为字符
            if (typeof Num == "number") {
                Num = new String(Num);
            };
            Num = Num.replace(/,/g, "") //替换tomoney()中的“,”
            Num = Num.replace(/ /g, "") //替换tomoney()中的空格
            Num = Num.replace(/￥/g, "") //替换掉可能出现的￥字符
            if (isNaN(Num)) { //验证输入的字符是否为数字
                //alert("请检查小写金额是否正确");
                return "";
            };
            //字符处理完毕后开始转换，采用前后两部分分别转换
            var part = String(Num).split(".");
            var newchar = "";
            //小数点前进行转化
            for (var i = part[0].length - 1; i >= 0; i--) {
                if (part[0].length > 10) {
                    return "";
                    //若数量超过拾亿单位，提示
                }
                var tmpnewchar = ""
                var perchar = part[0].charAt(i);
                switch (perchar) {
                    case "0":
                        tmpnewchar = "零" + tmpnewchar;
                        break;
                    case "1":
                        tmpnewchar = "壹" + tmpnewchar;
                        break;
                    case "2":
                        tmpnewchar = "贰" + tmpnewchar;
                        break;
                    case "3":
                        tmpnewchar = "叁" + tmpnewchar;
                        break;
                    case "4":
                        tmpnewchar = "肆" + tmpnewchar;
                        break;
                    case "5":
                        tmpnewchar = "伍" + tmpnewchar;
                        break;
                    case "6":
                        tmpnewchar = "陆" + tmpnewchar;
                        break;
                    case "7":
                        tmpnewchar = "柒" + tmpnewchar;
                        break;
                    case "8":
                        tmpnewchar = "捌" + tmpnewchar;
                        break;
                    case "9":
                        tmpnewchar = "玖" + tmpnewchar;
                        break;
                }
                switch (part[0].length - i - 1) {
                    case 0:
                        tmpnewchar = tmpnewchar + "元";
                        break;
                    case 1:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                        break;
                    case 2:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                        break;
                    case 3:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                        break;
                    case 4:
                        tmpnewchar = tmpnewchar + "万";
                        break;
                    case 5:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                        break;
                    case 6:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                        break;
                    case 7:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                        break;
                    case 8:
                        tmpnewchar = tmpnewchar + "亿";
                        break;
                    case 9:
                        tmpnewchar = tmpnewchar + "拾";
                        break;
                }
                var newchar = tmpnewchar + newchar;
            }
            //小数点之后进行转化
            if (Num.indexOf(".") != -1) {
                if (part[1].length > 2) {
                    // alert("小数点之后只能保留两位,系统将自动截断");
                    part[1] = part[1].substr(0, 2)
                }
                for (i = 0; i < part[1].length; i++) {
                    tmpnewchar = ""
                    perchar = part[1].charAt(i)
                    switch (perchar) {
                        case "0":
                            tmpnewchar = "零" + tmpnewchar;
                            break;
                        case "1":
                            tmpnewchar = "壹" + tmpnewchar;
                            break;
                        case "2":
                            tmpnewchar = "贰" + tmpnewchar;
                            break;
                        case "3":
                            tmpnewchar = "叁" + tmpnewchar;
                            break;
                        case "4":
                            tmpnewchar = "肆" + tmpnewchar;
                            break;
                        case "5":
                            tmpnewchar = "伍" + tmpnewchar;
                            break;
                        case "6":
                            tmpnewchar = "陆" + tmpnewchar;
                            break;
                        case "7":
                            tmpnewchar = "柒" + tmpnewchar;
                            break;
                        case "8":
                            tmpnewchar = "捌" + tmpnewchar;
                            break;
                        case "9":
                            tmpnewchar = "玖" + tmpnewchar;
                            break;
                    }
                    if (i == 0) tmpnewchar = tmpnewchar + "角";
                    if (i == 1) tmpnewchar = tmpnewchar + "分";
                    newchar = newchar + tmpnewchar;
                }
            }
            //替换所有无用汉字
            while (newchar.search("零零") != -1)
                newchar = newchar.replace("零零", "零");
            newchar = newchar.replace("零亿", "亿");
            newchar = newchar.replace("亿万", "亿");
            newchar = newchar.replace("零万", "万");
            newchar = newchar.replace("零元", "元");
            newchar = newchar.replace("零角", "");
            newchar = newchar.replace("零分", "");
            if (newchar.charAt(newchar.length - 1) == "元") {
                newchar = newchar + "整"
            }
            return newchar;
        }
    }
    //==========HTTP============================================================
    util.$httpObj = {
        /**
         * @param  {setting}
         */
        _ajax: function(setting) {
            //设置参数的初始值
            var opts = {
                method: (setting.method || "GET").toUpperCase(), //请求方式
                url: setting.url || "", // 请求地址
                async: setting.async || true, // 是否异步
                dataType: setting.dataType || "json", // 解析方式
                data: setting.data || "", // 参数
                success: setting.success || function() {}, // 请求成功回调
                error: setting.error || function() {} // 请求失败回调
            }

            // 参数格式化
            function params_format(obj) {
                var str = ''
                for (var i in obj) {
                    str += i + '=' + obj[i] + '&'
                }
                return str.split('').slice(0, -1).join('')
            }

            // 创建ajax对象
            var xhr = new XMLHttpRequest();

            // 连接服务器open(方法GET/POST，请求地址， 异步传输)
            if (opts.method == 'GET') {
                xhr.open(opts.method, opts.url + "?" + params_format(opts.data), opts.async);
                xhr.send();
            } else {
                xhr.open(opts.method, opts.url, opts.async);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send(opts.data);
            }

            /*
             ** 每当readyState改变时，就会触发onreadystatechange事件
             ** readyState属性存储有XMLHttpRequest的状态信息
             ** 0 ：请求未初始化
             ** 1 ：服务器连接已建立
             ** 2 ：请求已接受
             ** 3 : 请求处理中
             ** 4 ：请求已完成，且相应就绪
             */
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                    switch (opts.dataType) {
                        case "json":
                            var json = JSON.parse(xhr.responseText);
                            opts.success(json);
                            break;
                        case "xml":
                            opts.success(xhr.responseXML);
                            break;
                        default:
                            opts.success(xhr.responseText);
                            break;
                    }
                }
            }
            xhr.onerror = function(err) {
                opts.error(err);
            }
        },

        /**
         * @param  {url}
         * @param  {setting}
         * @return {Promise}
         */
        _fetch: function(url, setting) {
            //设置参数的初始值
            let opts = {
                method: (setting.method || 'GET').toUpperCase(), //请求方式
                headers: setting.headers || {}, // 请求头设置
                credentials: setting.credentials || true, // 设置cookie是否一起发送
                body: setting.body || {},
                mode: setting.mode || 'no-cors', // 可以设置 cors, no-cors, same-origin
                redirect: setting.redirect || 'follow', // follow, error, manual
                cache: setting.cache || 'default' // 设置 cache 模式 (default, reload, no-cache)
            }
            let dataType = setting.dataType || "json", // 解析方式  
                data = setting.data || "" // 参数

            // 参数格式化
            function params_format(obj) {
                var str = ''
                for (var i in obj) {
                    str += `${i}=${obj[i]}&`
                }
                return str.split('').slice(0, -1).join('')
            }

            if (opts.method === 'GET') {
                url = url + (data ? `?${params_format(data)}` : '')
            } else {
                setting.body = data || {}
            }
            return new Promise((resolve, reject) => {
                fetch(url, opts).then(async res => {
                    let data = dataType === 'text' ? await res.text() :
                        dataType === 'blob' ? await res.blob() : await res.json()
                    resolve(data)
                }).catch(e => {
                    reject(e)
                })
            })
        }
    }
    //======DOM类====================================================================
    util.$domObj = {
        select: '$',
        /**
         * 可以设置选择器的符号，默认为$
         * @param {Object} sl
         */
        _setSelector: function(sl) {
            this[sl] = this.$;
            delete this[this.select];
            this.select = sl;
        },
        $: function(selector) {
            var type = selector.substring(0, 1);
            if (type === '#') {
                if (document.querySelecotor) return document.querySelector(selector)
                return document.getElementById(selector.substring(1))

            } else if (type === '.') {
                if (document.querySelecotorAll) return document.querySelectorAll(selector)
                return document.getElementsByClassName(selector.substring(1))
            } else {
                return document['querySelectorAll' ? 'querySelectorAll' : 'getElementsByTagName'](selector)
            }
        },
        /**
         * 检测类名
         * @param {Object} ele 尽量穿dom进来，也可以支持  #id  .class
         * @param {Object} name class名称
         */
        _hasClass: function(ele, name) {
            if (!ele.className) { //没有dom的话就获取
                var fn_name = this.select;
                ele = this[fn_name](ele);
            }
            var r = ele.className.match(new RegExp('(\\s|^)' + name + '(\\s|$)'));
            if (r != null) {
                return true;
            }
            return false;
        },
        /*添加类名*/
        _addClass: function(ele, name) {
            if (!ele.className) { //没有dom的话就获取
                var fn_name = this.select;
                ele = this[fn_name](ele);
            }
            if (!this._hasClass(ele, name)) ele.className += " " + name;
        },
        /*删除类名*/
        _removeClass: function(ele, name) {
            if (!ele.className) { //没有dom的话就获取
                var fn_name = this.select;
                ele = this[fn_name](ele);
            }
            if (this._hasClass(ele, name)) {
                var reg = new RegExp('(\\s|^)' + name + '(\\s|$)');
                ele.className = ele.className.replace(reg, '');
            }
        },
        /*替换类名*/
        _replaceClass: function(ele, newName, oldName) {
            if (!ele.className) { //没有dom的话就获取
                var fn_name = this.select;
                ele = this[fn_name](ele);
            }
            this._removeClass(ele, oldName);
            this._addClass(ele, newName);
        },
        /*获取兄弟节点*/
        _getSiblings: function(ele) {
            console.log(ele.parentNode)
            if (!ele.parentNode) { //没有dom的话就获取
                var fn_name = this.select;
                ele = this[fn_name](ele);
            }
            var chid = ele.parentNode.children,
                eleMatch = [];
            for (var i = 0, len = chid.length; i < len; i++) {
                if (chid[i] != ele) {
                    eleMatch.push(chid[i]);
                }
            }
            return eleMatch;
        },
        /*获取行间样式属性*/
        _getByStyle: function(obj, name) {
            if (obj.currentStyle) {
                return obj.currentStyle[name];
            } else {
                return getComputedStyle(obj, false)[name];
            }
        }
    }
    //========浏览器缓存存储类==============================================================
    util.$storageObj = {
        ls: window.localStorage,
        ss: window.sessionStorage,
        /*-----------------cookie---------------------*/
        /*设置cookie*/
        _setCookie: function(name, value, day) {
            var setting = arguments[0];
            if (Object.prototype.toString.call(setting).slice(8, -1) === 'Object') {
                for (var i in setting) {
                    var oDate = new Date();
                    oDate.setDate(oDate.getDate() + day);
                    document.cookie = i + '=' + setting[i] + ';expires=' + oDate;
                }
            } else {
                var oDate = new Date();
                oDate.setDate(oDate.getDate() + day);
                document.cookie = name + '=' + value + ';expires=' + oDate;
            }

        },
        /*获取cookie*/
        _getCookie: function(name) {
            var arr = document.cookie.split('; ');
            for (var i = 0; i < arr.length; i++) {
                var arr2 = arr[i].split('=');
                if (arr2[0] == name) {
                    return arr2[1];
                }
            }
            return '';
        },
        /*删除cookie*/
        _removeCookie: function(name) {
            this._setCookie(name, 1, -1);
        },
        /*-----------------localStorage---------------------*/
        /*设置localStorage*/
        _setLocalStorage: function(key, val) {
            var setting = arguments[0];
            if (Object.prototype.toString.call(setting).slice(8, -1) === 'Object') {
                for (var i in setting) {
                    this.ls.setItem(i, JSON.stringify(setting[i]))
                }
            } else {
                this.ls.setItem(key, JSON.stringify(val))
            }
        },
        /*获取localStorage*/
        _getLocalStorage: function(key) {
            if (key) return JSON.parse(this.ls.getItem(key))
            return null;
        },
        /*移除localStorage*/
        _removeLocalStorage: function(key) {
            this.ls.removeItem(key)
        },
        /*移除所有localStorage*/
        _clearLocalStorage: function() {
            this.ls.clear()
        },
        /*-----------------sessionStorage---------------------*/
        /*设置sessionStorage*/
        _setSessionStorage: function(key, val) {
            var setting = arguments[0];
            if (Object.prototype.toString.call(setting).slice(8, -1) === 'Object') {
                for (var i in setting) {
                    this.ss.setItem(i, JSON.stringify(setting[i]))
                }
            } else {
                this.ss.setItem(key, JSON.stringify(val))
            }
        },
        /*获取sessionStorage*/
        _getSessionStorage: function(key) {
            if (key) return JSON.parse(this.ss.getItem(key))
            return null;
        },
        /*移除sessionStorage*/
        _removeSessionStorage: function(key) {
            this.ss.removeItem(key)
        },
        /*移除所有sessionStorage*/
        _clearSessionStorage: function() {
            this.ss.clear()
        }
    }
    //======URL类==============================================================
    util.$urlObj = {
        /*获取网址参数*/
        _getURLparam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = decodeURI(window.location.search).substr(1).match(reg);
            if (r != null) return r[2];
            return null;
        },
        /*获取全部url参数,并转换成json对象*/
        _getUrlAllParams: function(url) {
            var url = url ? url : window.location.href;
            var _pa = url.substring(url.indexOf('?') + 1),
                _arrS = _pa.split('&'),
                _rs = {};
            for (var i = 0, _len = _arrS.length; i < _len; i++) {
                var pos = _arrS[i].indexOf('=');
                if (pos == -1) {
                    continue;
                }
                var name = _arrS[i].substring(0, pos),
                    value = window.decodeURIComponent(_arrS[i].substring(pos + 1));
                _rs[name] = value;
            }
            return _rs;
        },

        /*删除url指定参数，返回url*/
        _delParamsUrl: function(url, name) {
            var baseUrl = url.split('?')[0] + '?';
            var query = url.split('?')[1];
            if (query.indexOf(name) > -1) {
                var obj = {}
                var arr = query.split("&");
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = arr[i].split("=");
                    obj[arr[i][0]] = arr[i][1];
                };
                delete obj[name];
                var url = baseUrl + JSON.stringify(obj).replace(/[\"\{\}]/g, "").replace(/\:/g, "=").replace(/\,/g, "&");
                return url
            } else {
                return url;
            }
        },
        _getHost: function() {
            //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
            var curWwwPath = window.document.location.href;
            //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
            var pathName = window.document.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            //获取主机地址，如： http://localhost:8083
            var localhostPath = curWwwPath.substring(0, pos);
            return localhostPath;
        },
        //获取项目根路径
        _getRootPath: function() {
            //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
            var curWwwPath = window.document.location.href;
            //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
            var pathName = window.document.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            //获取主机地址，如： http://localhost:8083
            var localhostPaht = curWwwPath.substring(0, pos);
            //获取带"/"的项目名，如：/uimcardprj
            var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            return (localhostPaht + projectName);
        }
    }
    //======色彩音频类=============================================================
    util.$mediaObj = {
        /*获取十六进制随机颜色*/
        _getRandomColor: function() {
            return '#' + (function(h) {
                return new Array(7 - h.length).join("0") + h;
            })((Math.random() * 0x1000000 << 0).toString(16));
        },
        /**
         * 图片加载后
         * @param {Object} arr 图片加载的url
         * @param {Object} callback 加载完成后的回调函数
         */
        _imgLoadAll: function(arr, callback) {
            var arrImg = [];
            for (var i = 0; i < arr.length; i++) {
                var img = new Image();
                img.src = arr[i];
                img.onload = function() {
                    arrImg.push(this);
                    if (arrImg.length == arr.length) {
                        callback && callback();
                    }
                }
            }
        },
        /**
         * 音频加载
         * @param {Object} src url
         * @param {Object} callback 回调函数
         */
        _loadAudio: function(src, callback) {
            var audio = new Audio(src);
            audio.onloadedmetadata = callback;
            audio.src = src;
        }
    }
    //====================================================================
    util.constant = {
        SUCCESS: '操作成功！',
        error500: '系统内部错误，请联系管理员！'
    };
    return util;
});