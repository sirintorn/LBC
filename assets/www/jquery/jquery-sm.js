jQuery.cookie = function (name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};

        if (value === null) {
            value = '';
            options.expires = -1;
        }

        var expires = '';

        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }

        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');

        return true;
    } else { // only name given, get cookie
        var cookieValue = null;

        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/*
 * Querystring Plugin
 * jQuery.query - Query String Modification and Creation for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/8/13
 *
 * @author Blair Mitchelmore
 * @version 2.1.7
 *
 **/
new function (settings) {
    // Various Settings
    var $separator = settings.separator || '&';
    var $spaces = settings.spaces === false ? false : true;
    var $suffix = settings.suffix === false ? '' : '[]';
    var $prefix = settings.prefix === false ? false : true;
    var $hash = $prefix ? settings.hash === true ? "#" : "?" : "";
    var $numbers = settings.numbers === false ? false : true;

    jQuery.query = new function () {
        var is = function (o, t) {
            return o != undefined && o !== null && (!!t ? o.constructor == t : true);
        };
        var parse = function (path) {
            var m, rx = /\[([^[]*)\]/g, match = /^([^[]+)(\[.*\])?$/.exec(path), base = match[1], tokens = [];
            while (m = rx.exec(match[2]))
                tokens.push(m[1]);
            return [base, tokens];
        };
        var set = function (target, tokens, value) {
            var o, token = tokens.shift();
            if (typeof target != 'object')
                target = null;
            if (token === "") {
                if (!target)
                    target = [];
                if (is(target, Array)) {
                    target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
                } else if (is(target, Object)) {
                    var i = 0;
                    while (target[i++] != null)
                        ;
                    target[--i] = tokens.length == 0 ? value : set(target[i], tokens.slice(0), value);
                } else {
                    target = [];
                    target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
                }
            } else if (token && token.match(/^\s*[0-9]+\s*$/)) {
                var index = parseInt(token, 10);
                if (!target)
                    target = [];
                target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
            } else if (token) {
                var index = token.replace(/^\s*|\s*$/g, "");
                if (!target)
                    target = {};
                if (is(target, Array)) {
                    var temp = {};
                    for (var i = 0; i < target.length; ++i) {
                        temp[i] = target[i];
                    }
                    target = temp;
                }
                target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
            } else {
                return value;
            }
            return target;
        };

        var queryObject = function (a) {
            var self = this;
            self.keys = {};

            if (a.queryObject) {
                jQuery.each(a.get(), function (key, val) {
                    self.SET(key, val);
                });
            } else {
                jQuery.each(arguments, function () {
                    var q = "" + this;
                    q = q.replace(/^[?#]/, ''); // remove any leading ? || #
                    q = q.replace(/[;&]$/, ''); // remove any trailing & || ;
                    if ($spaces)
                        q = q.replace(/[+]/g, ' '); // replace +'s with spaces

                    jQuery.each(q.split(/[&;]/), function () {
                        var key = decodeURIComponent(this.split('=')[0] || "");
                        var val = decodeURIComponent(this.split('=')[1] || "");

                        if (!key)
                            return;

                        if ($numbers) {
                            if (/^[+-]?[0-9]+\.[0-9]*$/.test(val)) // simple float regex
                                val = parseFloat(val);
                            else if (/^[+-]?[0-9]+$/.test(val)) // simple int regex
                                val = parseInt(val, 10);
                        }

                        val = (!val && val !== 0) ? true : val;

                        if (val !== false && val !== true && typeof val != 'number')
                            val = val;

                        self.SET(key, val);
                    });
                });
            }
            return self;
        };

        queryObject.prototype = {
            queryObject: true,
            has: function (key, type) {
                var value = this.get(key);
                return is(value, type);
            },
            GET: function (key) {
                if (!is(key))
                    return this.keys;
                var parsed = parse(key), base = parsed[0], tokens = parsed[1];
                var target = this.keys[base];
                while (target != null && tokens.length != 0) {
                    target = target[tokens.shift()];
                }
                return typeof target == 'number' ? target : target || "";
            },
            get: function (key) {
                var target = this.GET(key);
                if (is(target, Object))
                    return jQuery.extend(true, {}, target);
                else if (is(target, Array))
                    return target.slice(0);
                return target;
            },
            SET: function (key, val) {
                var value = !is(val) ? null : val;
                var parsed = parse(key), base = parsed[0], tokens = parsed[1];
                var target = this.keys[base];
                this.keys[base] = set(target, tokens.slice(0), value);
                return this;
            },
            set: function (key, val) {
                return this.copy().SET(key, val);
            },
            REMOVE: function (key) {
                return this.SET(key, null).COMPACT();
            },
            remove: function (key) {
                return this.copy().REMOVE(key);
            },
            EMPTY: function () {
                var self = this;
                jQuery.each(self.keys, function (key, value) {
                    delete self.keys[key];
                });
                return self;
            },
            load: function (url) {
                var hash = url.replace(/^.*?[#](.+?)(?:\?.+)?$/, "$1");
                var search = url.replace(/^.*?[?](.+?)(?:#.+)?$/, "$1");
                return new queryObject(url.length == search.length ? '' : search, url.length == hash.length ? '' : hash);
            },
            empty: function () {
                return this.copy().EMPTY();
            },
            copy: function () {
                return new queryObject(this);
            },
            COMPACT: function () {
                function build(orig) {
                    var obj = typeof orig == "object" ? is(orig, Array) ? [] : {} : orig;
                    if (typeof orig == 'object') {
                        function add(o, key, value) {
                            if (is(o, Array))
                                o.push(value);
                            else
                                o[key] = value;
                        }
                        jQuery.each(orig, function (key, value) {
                            if (!is(value))
                                return true;
                            add(obj, key, build(value));
                        });
                    }
                    return obj;
                }
                this.keys = build(this.keys);
                return this;
            },
            compact: function () {
                return this.copy().COMPACT();
            },
            toString: function () {
                var i = 0, queryString = [], chunks = [], self = this;
                var encode = function (str) {
                    str = str + "";
                    if ($spaces)
                        str = str.replace(/ /g, "+");
                    return encodeURIComponent(str);
                };
                var addFields = function (arr, key, value) {
                    if (!is(value) || value === false)
                        return;
                    var o = [encode(key)];
                    if (value !== true) {
                        o.push("=");
                        o.push(encode(value));
                    }
                    arr.push(o.join(""));
                };
                var build = function (obj, base) {
                    var newKey = function (key) {
                        return !base || base == "" ? [key].join("") : [base, "[", key, "]"].join("");
                    };
                    jQuery.each(obj, function (key, value) {
                        if (typeof value == 'object')
                            build(value, newKey(key));
                        else
                            addFields(chunks, newKey(key), value);
                    });
                };

                build(this.keys);

                if (chunks.length > 0)
                    queryString.push($hash);
                queryString.push(chunks.join($separator));

                return queryString.join("");
            }
        };

        return new queryObject(location.search, location.hash);
    };
}(jQuery.query || {}); // Pass in jQuery.query as settings object

/*** Sort Select Function***/
jQuery.fn.sort = function () {
    return this.pushStack([].sort.apply(this, arguments), []);
};

jQuery.fn.sortOptions = function (sortCallback) {
    jQuery('option', this)
            .sort(sortCallback)
            .appendTo(this);
    return this;
};

jQuery.fn.sortOptionsByText = function () {
    var byTextSortCallback = function (x, y) {
        var xText = jQuery(x).text().toUpperCase();
        var yText = jQuery(y).text().toUpperCase();
        return (xText < yText) ? -1 : (xText > yText) ? 1 : 0;
    };
    return this.sortOptions(byTextSortCallback);
};
jQuery.fn.sortOptionsByValue = function () {
    var byValueSortCallback = function (x, y) {
        var xVal = jQuery(x).val();
        var yVal = jQuery(y).val();
        return (xVal < yVal) ? -1 : (xVal > yVal) ? 1 : 0;
    };
    return this.sortOptions(byValueSortCallback);
};

/* Format Number */
/*
 * How to use it:
 * var formated_value = $().number_format(final_value);
 *
 * Advanced:
 * var formated_value = $().number_format(final_value, {numberOfDecimals:3,
 *                                                      decimalSeparator: '.',
 *                                                      thousandSeparator: ',',
 *                                                      symbol: 'R$'});
 */
jQuery.fn.extend({
    number_format: function (numero, params)
    {
        //parametros default
        var sDefaults = {
            numberOfDecimals: 2,
            decimalSeparator: ',',
            thousandSeparator: '.',
            symbol: ''
        };

        //fun��o do jquery que substitui os parametros que n�o foram informados pelos defaults
        var options = jQuery.extend(sDefaults, params);

        //CORPO DO PLUGIN
        var number = numero;
        var decimals = options.numberOfDecimals;
        var dec_point = options.decimalSeparator;
        var thousands_sep = options.thousandSeparator;
        var currencySymbol = options.symbol;

        var exponent = "";
        var numberstr = number.toString();
        var eindex = numberstr.indexOf("e");
        if (eindex > -1)
        {
            exponent = numberstr.substring(eindex);
            number = parseFloat(numberstr.substring(0, eindex));
        }

        if (decimals != null)
        {
            var temp = Math.pow(10, decimals);
            number = Math.round(number * temp) / temp;
        }
        var sign = number < 0 ? "-" : "";
        var integer = (number > 0 ?
                Math.floor(number) : Math.abs(Math.ceil(number))).toString();

        var fractional = number.toString().substring(integer.length + sign.length);
        dec_point = dec_point != null ? dec_point : ".";
        fractional = decimals != null && decimals > 0 || fractional.length > 1 ?
                (dec_point + fractional.substring(1)) : "";
        if (decimals != null && decimals > 0)
        {
            for (i = fractional.length - 1, z = decimals; i < z; ++i)
                fractional += "0";
        }

        thousands_sep = (thousands_sep != dec_point || fractional.length == 0) ?
                thousands_sep : null;
        if (thousands_sep != null && thousands_sep != "")
        {
            for (i = integer.length - 3; i > 0; i -= 3)
                integer = integer.substring(0, i) + thousands_sep + integer.substring(i);
        }

        if (options.symbol == '')
        {
            return sign + integer + fractional + exponent;
        }
        else
        {
            return currencySymbol + ' ' + sign + integer + fractional + exponent;
        }
        //FIM DO CORPO DO PLUGIN

    }
});

/* Date Format */
/*
 DATE AND TIME PATTERNS
 * yyyy = year
 * MM = month
 * MMM = month abbreviation (Jan, Feb … Dec)
 * MMMM = long month (January, February … December)
 * ddd = day of the week in words (Monday, Tuesday … Sunday)
 * dd = day
 * hh = hour in am/pm (1-12)
 * HH = hour in day (0-23)
 * mm = minute
 * ss = second
 * a = am/pm marker
 * SSS = milliseconds
 
 EXPECTED INPUT DATES FORMATS
 
 2009-12-18 10:54:50.546 (default java.util.Date.toString output)
 Wed Jan 13 10:43:41 CET 2010 (???)
 2010-10-19T11:40:33.527+02:00 (default JAXB formatting of java.util.Date)
 Sat Mar 05 2011 11:47:35 GMT-0300 (BRT) (default JavaScript new Date().toString() output)
 EXAMPLES
 
 Formatting using css classes
 
 <span class="shortDateFormat">2009-12-18 10:54:50.546</span>
 <span class="longDateFormat">2009-12-18 10:54:50.546</span>
 Output
 
 #1 18/12/2009
 #2 18/12/2009 10:54:50
 
 Formatting using JavaScript
 
 <script>
 document.write($.format.date("2009-12-18 10:54:50.546", "Test: dd/MM/yyyy"));
 document.write($.format.date("Wed Jan 13 10:43:41 CET 2010", "dd~MM~yyyy"));
 </script>
 Output
 
 #1 Test: 18/12/2009
 #2 18~12~2009
 
 The css class names patterns by default are
 
 * shortDateFormat = dd/MM/yyyy
 * longDateFormat = dd/MM/yyyy hh:mm:ss
 */
(function ($) {
    var daysInWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var shortMonthsInYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var longMonthsInYear = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    var shortMonthsToNumber = [];

    shortMonthsToNumber["Jan"] = "01";
    shortMonthsToNumber["Feb"] = "02";
    shortMonthsToNumber["Mar"] = "03";
    shortMonthsToNumber["Apr"] = "04";
    shortMonthsToNumber["May"] = "05";
    shortMonthsToNumber["Jun"] = "06";
    shortMonthsToNumber["Jul"] = "07";
    shortMonthsToNumber["Aug"] = "08";
    shortMonthsToNumber["Sep"] = "09";
    shortMonthsToNumber["Oct"] = "10";
    shortMonthsToNumber["Nov"] = "11";
    shortMonthsToNumber["Dec"] = "12";

    $.format = (function () {
        function strDay(value) {
            return daysInWeek[parseInt(value, 10)] || value;
        }

        function strMonth(value) {
            var monthArrayIndex = parseInt(value, 10) - 1;
            return shortMonthsInYear[monthArrayIndex] || value;
        }

        function strLongMonth(value) {
            var monthArrayIndex = parseInt(value, 10) - 1;
            return longMonthsInYear[monthArrayIndex] || value;
        }

        var parseMonth = function (value) {
            return shortMonthsToNumber[value] || value;
        };

        var parseTime = function (value) {
            var retValue = value;
            var millis = "";
            if (retValue.indexOf(".") !== -1) {
                var delimited = retValue.split('.');
                retValue = delimited[0];
                millis = delimited[1];
            }

            var values3 = retValue.split(":");

            if (values3.length === 3) {
                hour = values3[0];
                minute = values3[1];
                second = values3[2];

                return {
                    time: retValue,
                    hour: hour,
                    minute: minute,
                    second: second,
                    millis: millis
                };
            } else {
                return {
                    time: "",
                    hour: "",
                    minute: "",
                    second: "",
                    millis: ""
                };
            }
        };

        return {
            date: function (value, format) {
                /*
                 value = new java.util.Date()
                 2009-12-18 10:54:50.546
                 */
                try {
                    var date = null;
                    var year = null;
                    var month = null;
                    var dayOfMonth = null;
                    var dayOfWeek = null;
                    var time = null;
                    if (typeof value.getFullYear === "function") {
                        year = value.getFullYear();
                        month = value.getMonth() + 1;
                        dayOfMonth = value.getDate();
                        dayOfWeek = value.getDay();
                        time = parseTime(value.toTimeString());
                    } else if (value.search(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[-+]?\d{2}:\d{2}/) != -1) { /* 2009-04-19T16:11:05+02:00 */
                        var values = value.split(/[T\+-]/);
                        year = values[0];
                        month = values[1];
                        dayOfMonth = values[2];
                        time = parseTime(values[3].split(".")[0]);
                        date = new Date(year, month - 1, dayOfMonth);
                        dayOfWeek = date.getDay();
                    } else {
                        var values = value.split(" ");
                        switch (values.length) {
                            case 6:
                                /* Wed Jan 13 10:43:41 CET 2010 */
                                year = values[5];
                                month = parseMonth(values[1]);
                                dayOfMonth = values[2];
                                time = parseTime(values[3]);
                                date = new Date(year, month - 1, dayOfMonth);
                                dayOfWeek = date.getDay();
                                break;
                            case 2:
                                /* 2009-12-18 10:54:50.546 */
                                var values2 = values[0].split("-");
                                year = values2[0];
                                month = values2[1];
                                dayOfMonth = values2[2];
                                time = parseTime(values[1]);
                                date = new Date(year, month - 1, dayOfMonth);
                                dayOfWeek = date.getDay();
                                break;
                            case 7:
                                /* Tue Mar 01 2011 12:01:42 GMT-0800 (PST) */
                            case 9:
                                /*added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time) */
                            case 10:
                                /* added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time) */
                                year = values[3];
                                month = parseMonth(values[1]);
                                dayOfMonth = values[2];
                                time = parseTime(values[4]);
                                date = new Date(year, month - 1, dayOfMonth);
                                dayOfWeek = date.getDay();
                                break;
                            default:
                                return value;
                        }
                    }

                    var pattern = "";
                    var retValue = "";
                    /*
                     Issue 1 - variable scope issue in format.date
                     Thanks jakemonO
                     */
                    for (var i = 0; i < format.length; i++) {
                        var currentPattern = format.charAt(i);
                        pattern += currentPattern;
                        switch (pattern) {
                            case "ddd":
                                retValue += strDay(dayOfWeek);
                                pattern = "";
                                break;
                            case "dd":
                                if (format.charAt(i + 1) == "d") {
                                    break;
                                }
                                if (String(dayOfMonth).length === 1) {
                                    dayOfMonth = '0' + dayOfMonth;
                                }
                                retValue += dayOfMonth;
                                pattern = "";
                                break;
                            case "MMMM":
                                retValue += strLongMonth(month);
                                pattern = "";
                                break;
                            case "MMM":
                                if (format.charAt(i + 1) === "M") {
                                    break;
                                }
                                retValue += strMonth(month);
                                pattern = "";
                                break;
                            case "MM":
                                if (format.charAt(i + 1) == "M") {
                                    break;
                                }
                                if (String(month).length === 1) {
                                    month = '0' + month;
                                }
                                retValue += month;
                                pattern = "";
                                break;
                            case "yyyy":
                                retValue += year;
                                pattern = "";
                                break;
                            case "HH":
                                retValue += time.hour;
                                pattern = "";
                                break;
                            case "hh":
                                /* time.hour is "00" as string == is used instead of === */
                                retValue += (time.hour == 0 ? 12 : time.hour < 13 ? time.hour : time.hour - 12);
                                pattern = "";
                                break;
                            case "mm":
                                retValue += time.minute;
                                pattern = "";
                                break;
                            case "ss":
                                /* ensure only seconds are added to the return string */
                                retValue += time.second.substring(0, 2);
                                pattern = "";
                                break;
                            case "SSS":
                                retValue += time.millis.substring(0, 3);
                                pattern = "";
                                break;
                            case "a":
                                retValue += time.hour >= 12 ? "PM" : "AM";
                                pattern = "";
                                break;
                            case " ":
                                retValue += currentPattern;
                                pattern = "";
                                break;
                            case "/":
                                retValue += currentPattern;
                                pattern = "";
                                break;
                            case ":":
                                retValue += currentPattern;
                                pattern = "";
                                break;
                            default:
                                if (pattern.length === 2 && pattern.indexOf("y") !== 0 && pattern != "SS") {
                                    retValue += pattern.substring(0, 1);
                                    pattern = pattern.substring(1, 2);
                                } else if ((pattern.length === 3 && pattern.indexOf("yyy") === -1)) {
                                    pattern = "";
                                }
                        }
                    }
                    return retValue;
                } catch (e) {
                    console.log(e);
                    return value;
                }
            }
        };
    }());
}(jQuery));

$(document).ready(function () {
    $(".shortDateFormat").each(function (idx, elem) {
        if ($(elem).is(":input")) {
            $(elem).val($.format.date($(elem).val(), "dd/MM/yyyy"));
        } else {
            $(elem).text($.format.date($(elem).text(), "dd/MM/yyyy"));
        }
    });
    $(".longDateFormat").each(function (idx, elem) {
        if ($(elem).is(":input")) {
            $(elem).val($.format.date($(elem).val(), "dd/MM/yyyy hh:mm:ss"));
        } else {
            $(elem).text($.format.date($(elem).text(), "dd/MM/yyyy hh:mm:ss"));
        }
    });
});

/* Thanate Function */
//========= function Add Hours
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
};

String.prototype.padLeft = function (l, c) {
    return Array(l - this.length + 1).join(c || " ") + this;
};

function create_cell(otext, oalign, owrap, opaddingleft) {
    oalign = (oalign || oalign == '') ? oalign : 'left';
    owrap = (owrap || owrap == '') ? owrap : 'nowrap';
    opaddingleft = (opaddingleft ? opaddingleft : '5px') || (opaddingleft == '' ? opaddingleft : '0px');

    if (otext == '') {
        otext = '-';
    }

    var ocell = document.createElement('td');
    ocell.style.textAlign = oalign;
    ocell.style.whiteSpace = owrap;
    ocell.style.paddingLeft = opaddingleft;
    ocell.innerHTML = otext;

    return ocell;
}

function createPrintPage(print_content, print_title, page_title) {
    print_title = (print_title == undefined || print_title == '') ? "Software Maker Co., Ltd." : print_title;
    page_title = (page_title == undefined || page_title == '') ? "Print Document :: Software Maker Co., Ltd." : page_title;

    var tag_page = "<html>";
    tag_page += "<head>";
    tag_page += "<title>" + page_title + "</title>";
    tag_page += "<link rel='shortcut icon' href='images/login/favicon.ico' />";
    tag_page += "<link href='css/default/DefaultStyle.css' rel='stylesheet' type='text/css' />";
    tag_page += "</head>";
    tag_page += "<body onLoad='self.print();'>";
    tag_page += "<div style='margin:5px 0 5px 0; font-size:20px;font-weight:bold;'>" + print_title + "</div>";
    tag_page += "<center>" + print_content + "</center>";
    tag_page += "</body>";
    tag_page += "</html>";

    return tag_page;
}

function getFormRequest(obj_form) {
    var arr_request = new Array();

    for (var i = 0; i < obj_form.elements.length; i++) {
        if (obj_form.elements[i].type != "jqGrid") {
            var el_id = encodeURIComponent(obj_form.elements[i].id);
            var el_value = encodeURIComponent(obj_form.elements[i].value);

            if (obj_form.elements[i].type == "checkbox") {
                el_value = obj_form.elements[i].checked;
            }

            var param = el_id;
            param += "=";
            param += el_value;
            arr_request.push(param);
        }
    }

    return arr_request.join("&");
}

function PringPage(print_container, print_title, page_title) {
    var MyLeft = 5;
    var MyTop = 5;
    var oWidth = screen.width - 20;
    var oHeight = screen.height - 130;
    var page_option = 'width=' + oWidth + ',height=' + oHeight + ',' +
            'left=' + MyLeft + ',top=' + MyTop + ',' +
            'resizable=0,scrollbars=1,status=1,titlebar=0,toolbar=1,location=0,directories=0,menubar=0';

    var print_content = createPrintPage($(print_container).innerHTML, print_title, page_title);
    print_content = print_content.replace(/<a.*?>/gi, "");
    print_content = print_content.replace(/<\/a>/gi, "");

    var o_page = window.open("", "printpage", page_option);
    o_page.document.open();
    o_page.document.write(print_content);
    o_page.document.close();
    o_page.focus();
}

function DoubleFilter(e) {
    var evt = window.event ? event : e;
    var unicode = evt.charCode ? evt.charCode : evt.keyCode;
    var ochar = String.fromCharCode(unicode);

    if (ochar == "." && evt.target.value.indexOf(".") > -1) {
        return false;
    } else {
        return validateDouble(ochar);
    }
}

function NumberFilter(e) {
    var evt = window.event ? event : e;
    var unicode = evt.charCode ? evt.charCode : evt.keyCode;
    var ochar = String.fromCharCode(unicode);

    return validateNumber(ochar);
}

function TextFilter(e) {
    var evt = window.event ? event : e;
    var unicode = evt.charCode ? evt.charCode : evt.keyCode;
    var ochar = String.fromCharCode(unicode);

    return validateInput(ochar);
}

function LowerCaseFilter(e) {
    var evt = window.event ? event : e;
    var unicode = evt.charCode ? evt.charCode : evt.keyCode;
    var ochar = String.fromCharCode(unicode);

    return validateInputLowerCase(ochar);
}

function validateInput(otext) {
    var validchar = /[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321_@#]/;
    var char_len = otext.toString().length;

    for (var i = 0; i < char_len; i++) {
        var ochar = otext.toString().charAt(i);

        if (ochar.toString().search(validchar) == -1) {
            return false;
        }
    }

    return true;
}

function validateInputLowerCase(otext) {
    var validchar = /[abcdefghijklmnopqrstuvwxyz0987654321_@#]/;
    var char_len = otext.toString().length;

    for (var i = 0; i < char_len; i++) {
        var ochar = otext.toString().charAt(i);

        if (ochar.toString().search(validchar) == -1) {
            return false;
        }
    }

    return true;
}

function validateNumber(onumber) {
    var validchar = /[0987654321]/;
    var char_len = onumber.toString().length;

    for (var i = 0; i < char_len; i++) {
        var ochar = onumber.toString().charAt(i);

        if (ochar.toString().search(validchar) == -1) {
            return false;
        }
    }

    return true;
}

function validateDouble(onumber) {
    var validchar = /[0987654321.]/;
    var char_len = onumber.toString().length;

    for (var i = 0; i < char_len; i++) {
        var ochar = onumber.toString().charAt(i);

        if (ochar.toString().search(validchar) == -1) {
            return false;
        }
    }

    return true;
}

function validateMobile(obj_text, obj_display, error_message, is_require) {
    var chk = true;

    if (is_require) {
        chk = requireValidate(obj_text, obj_display, error_message);
    }

    if (chk) {
        if ($("#" + obj_text).val() == '') {
            $("#" + obj_display).html('');
            $("#" + obj_display).css("visibility", "hidden");

            $("#" + obj_text).removeClass("ui-state-error");
            return true;
        } else {
            emailPattern = /[0987654321]/;

            if (emailPattern.test($("#" + obj_text).val())) {
                $("#" + obj_display).html('');
                $("#" + obj_display).css("visibility", "hidden");

                $("#" + obj_text).removeClass("ui-state-error");
                return true;
            } else {
                if ($("#" + obj_text).val() != '') {
                    $("#" + obj_display).html(error_message);
                    $("#" + obj_display).css("visibility", "visible");

                    $("#" + obj_text).addClass("ui-state-error");
                    return false;
                } else {
                    $("#" + obj_display).html('');
                    $("#" + obj_display).css("visibility", "hidden");
                    $("#" + obj_text).removeClass("ui-state-error");
                    return true;
                }
            }
        }
    } else {
        if ($("#" + obj_text).val() == '') {
            $("#" + obj_display).html('');
            $("#" + obj_display).css("visibility", "hidden");
            $("#" + obj_text).removeClass("ui-state-error");
            return true;
        }
        return false;
    }
}

function validateDateTime(obj_text, obj_display, error_message, is_require) {
    var chk = true;

    if (is_require) {
        chk = requireValidate(obj_text, obj_display, error_message);
    }

    if (chk) {
        if ($("#" + obj_text).val() == '') {
            $("#" + obj_display).html('');
            $("#" + obj_display).css("visibility", "hidden");

            $("#" + obj_text).removeClass("ui-state-error");
            return true;
        } else {
            var emailPattern = /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/;

            if (emailPattern.test($("#" + obj_text).val())) {
                $("#" + obj_display).html('');
                $("#" + obj_display).css("visibility", "hidden");

                $("#" + obj_text).removeClass("ui-state-error");
                return true;
            } else {
                if ($("#" + obj_text).val() != '') {
                    $("#" + obj_display).html(error_message);
                    $("#" + obj_display).css("visibility", "visible");

                    $("#" + obj_text).addClass("ui-state-error");
                    return false;
                } else {
                    $("#" + obj_display).html('');
                    $("#" + obj_display).css("visibility", "hidden");
                    $("#" + obj_text).removeClass("ui-state-error");
                    return true;
                }
            }
        }
    } else {
        if ($("#" + obj_text).val() == '') {
            $("#" + obj_display).html('');
            $("#" + obj_display).css("visibility", "hidden");
            $("#" + obj_text).removeClass("ui-state-error");
            return true;
        }
        return false;
    }
}

function validateEmail(obj_text, obj_display, error_message, is_require) {
    var chk = true;

    if (is_require) {
        chk = requireValidate(obj_text, obj_display, error_message);
    }

    if (chk) {
        if ($("#" + obj_text).val() == '') {
            $("#" + obj_display).html('');
            $("#" + obj_display).css("visibility", "hidden");

            $("#" + obj_text).removeClass("ui-state-error");
            return true;
        } else {
            var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

            if (emailPattern.test($("#" + obj_text).val())) {
                $("#" + obj_display).html('');
                $("#" + obj_display).css("visibility", "hidden");

                $("#" + obj_text).removeClass("ui-state-error");
                return true;
            } else {
                $("#" + obj_display).html(error_message);
                $("#" + obj_display).css("visibility", "visible");

                $("#" + obj_text).addClass("ui-state-error");
                return false;
            }
        }
    } else {
        return false;
    }
}

function requireValidate(obj_text, obj_display, error_message) {
    if ($("#" + obj_text).val() == '') {
        $("#" + obj_display).html(error_message);
        $("#" + obj_display).css("visibility", "visible");

        $("#" + obj_text).addClass("ui-state-error");
        return false;
    } else {
        $("#" + obj_display).html('');
        $("#" + obj_display).css("visibility", "hidden");

        $("#" + obj_text).removeClass("ui-state-error");
        return true;
    }
}

function SMClock(elem_clock) {
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var currentSeconds = currentTime.getSeconds();

    // Pad the minutes and seconds with leading zeros, if required
    currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
    currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

    // Choose either "AM" or "PM" as appropriate
    var timeOfDay = (currentHours < 12) ? "AM" : "PM";
    timeOfDay = "";

    // Convert the hours component to 12-hour format if needed
    //currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

    // Convert an hours component of "0" to "12"
    //currentHours = ( currentHours == 0 ) ? 12 : currentHours;

    // Compose the string for display
    var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds + " " + timeOfDay;

    $("#" + elem_clock).html(currentTimeString);
}

function SMClockDate(elem_clock) {
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var currentSeconds = currentTime.getSeconds();

    // Pad the minutes and seconds with leading zeros, if required
    currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
    currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

    // Choose either "AM" or "PM" as appropriate
    var timeOfDay = (currentHours < 12) ? "AM" : "PM";
    timeOfDay = "";

    // Convert the hours component to 12-hour format if needed
    //currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;

    // Convert an hours component of "0" to "12"
    //currentHours = ( currentHours == 0 ) ? 12 : currentHours;

    // Compose the string for display
    var currentDate = (currentTime.getDate() < 10 ? "0" : "") + currentTime.getDate();
    var currentMonth = currentTime.getMonth() + 1;
    currentMonth = (currentMonth < 10 ? "0" : "") + currentMonth;

    var currentDateString = currentDate + "-" + currentMonth + "-" + currentTime.getFullYear();
    var currentTimeString = currentHours + ":" + currentMinutes + " " + timeOfDay;

    $("#" + elem_clock).html(currentDateString + " " + currentTimeString);
}

function addEventEnter(obj, invoker) {
    $("#" + obj).keypress(function (event) {
        if (event.which == "13") {
            invoker();
            event.preventDefault();
            return false;
        } else {
            return true;
        }
    });
}

function getDistance(from_lat, from_lng, to_lat, to_lng) {
    var LATDegDiff = 0, LONDegDiff = 0, LATMinDiff = 0, LONMinDiff = 0;

    LATDegDiff = to_lat - from_lat;
    LATDegDiff = LATDegDiff * 111117.888;
    LATDegDiff = Math.pow(LATDegDiff, 2); // 10 ยกกำลัง 2

    LONDegDiff = to_lng - from_lng;
    LONDegDiff = LONDegDiff * 111117.888;
    LONDegDiff = Math.pow(LONDegDiff, 2); // 10 ยกกำลัง 2

    LONMinDiff = LATDegDiff + LONDegDiff;
    LATMinDiff = Math.sqrt(LONMinDiff);
    LATMinDiff = LATMinDiff / 1000;

    return LATMinDiff;
}

function HilightRow(gridname, row_id, fill_color, start_index, skip_index, hidezero) {
    if (row_id == "") {
        return false;
    }

    start_index = (start_index == undefined) ? -1 : start_index;
    skip_index = (skip_index == undefined) ? -1 : skip_index;
    hidezero = (hidezero == undefined) ? false : hidezero;

    var colmodel = $("#" + gridname).jqGrid("getGridParam", "colModel");

    $.each(colmodel, function (index, data) {
        if (index > start_index && index != skip_index) {
            var rowstyle = null;
            var rowdata = $("#" + gridname).getRowData(row_id);

            if (hidezero) {
                if (parseFloat(rowdata[data.name]) == 0) {
                    rowstyle = {
                        "color": fill_color,
                        "background-color": fill_color
                    };
                }

                if (fill_color == "#FFFFFF") {
                    rowstyle = {
                        "color": "#000000",
                        "background-color": fill_color
                    };
                }
            } else {
                rowstyle = {
                    "background-color": fill_color
                };
            }

            $("#" + gridname).setCell(row_id, data.name, "", rowstyle);
        }
    });

    return true;
}

function getFormat(type) {
    if (type == "number") {
        return {
            decimalSeparator: ".",
            thousandsSeparator: ",",
            decimalPlaces: 2,
            defaultValue: "0.00"
        };
    } else if (type == "point") {
        return {
            decimalSeparator: ".",
            thousandsSeparator: ",",
            decimalPlaces: 6,
            defaultValue: "0.00000"
        };
    } else {
        return {
            decimalSeparator: ".",
            thousandsSeparator: ",",
            decimalPlaces: 0,
            defaultValue: "0"
        };
    }
}

function SetEmptyGrid(grdname, display) {
    display = (display == undefined) ? "--- Record not found ---" : display;
    display = (display == "") ? "--- Record not found ---" : display;

    //get grid element
    var grdbody = $("#" + grdname).children("tbody");
    //get column model
    var colmodel = $("#" + grdname).jqGrid("getGridParam", "colModel");

    var firstrow = grdbody.children("tr.jqgfirstrow");
    var blankrow = '<tr class="jqgrow"><td colspan="' + colmodel.length + '" style="text-align:center; cursor: pointer"><b>' + display + '</b></td></tr>';

    grdbody.empty().append(firstrow).append(blankrow);
}

function getDateTime(odate) {
    if (odate == null || odate == "") {
        return null;
    }

    var spdatetime = odate.split(" ");
    var spdate = spdatetime[0].split("-");
    var sptime = spdatetime[1].split(":");
    var strm = "";

    var yidx = (spdate[0].length == 4) ? yidx = 0 : yidx = 2;
    var dayidx = (spdate[0].length == 2) ? dayidx = 0 : dayidx = 2;

    //year
    var yy = parseInt(spdate[yidx]);

    //month
    strm = spdate[1];

    if (strm !== '0') {
        try {
            if (strm.toString().substr(0, 1) == '0') {
                strm = strm.toString().substr(1, 1);
            }
        } catch (ex) {
            strm = spdate[1];
        }
    }

    var mm = parseInt(strm) - 1;

    //day
    strm = spdate[dayidx];

    if (strm !== '0') {
        if (strm.toString().substr(0, 1) == '0') {
            strm = strm.toString().substr(1, 1);
        }
    }

    var dd = parseInt(strm);

    //hour
    strm = sptime[0];

    if (strm !== '0') {
        if (strm.toString().substr(0, 1) == '0') {
            strm = strm.toString().substr(1, 1);
        }
    }

    var h = parseInt(strm);

    //minute
    strm = sptime[1];

    if (strm !== '0') {
        try {
            if (strm.toString().substr(0, 1) == '0') {
                strm = strm.toString().substr(1, 1);
            }
        } catch (ex) {
            strm = sptime[1];
        }
    }

    var m = parseInt(strm);

    var ret_date = new Date();
    ret_date.setFullYear(yy, mm, dd);
    ret_date.setHours(h);
    ret_date.setMinutes(m);

    return ret_date;
}

function getStringDate(odate, gettime, format, separator) {
    if (odate == undefined || odate == "") {
        return "";
    }

    gettime = (gettime == undefined) ? true : gettime;
    format = (format == undefined) ? "ymd" : format;
    separator = (separator == undefined) ? "-" : separator;

    var dd = odate.getDate();
    dd = (dd.toString().length == 1) ? ("0" + dd.toString()) : dd.toString();

    var mm = odate.getMonth() + 1;
    mm = (mm.toString().length == 1) ? ("0" + mm.toString()) : mm.toString();

    var yyyy = odate.getFullYear();

    var h = odate.getHours();
    h = (h.toString().length == 1) ? ("0" + h.toString()) : h.toString();

    var m = odate.getMinutes();
    m = (m.toString().length == 1) ? ("0" + m.toString()) : m.toString();

    var s = odate.getSeconds();
    s = (s.toString().length == 1) ? ("0" + s.toString()) : s.toString();

    var xdate = "";

    if (format == "ymd") {
        xdate = yyyy + separator + mm + separator + dd;
    } else if (format == "dmy") {
        xdate = dd + separator + mm + separator + yyyy;
    }

    xdate = (gettime) ? xdate + " " + h + ":" + m + ":" + s : xdate;
    return xdate;
}

function getStringValue(val, ochar) {
    ochar = (ochar == undefined) ? "-" : ochar;
    return (val == "") ? ochar : val;
}

function getSelectValue(val, ochar) {
    ochar = (ochar == undefined) ? "-" : ochar;
    return (val == "99999") ? ochar : val;
}

function getSelectRadio(elemname) {
    return $("input[name='" + elemname + "']:checked").val();
}

function setSelectRadio(elemName, selectValue) {
    $("input[name='" + elemName + "']").filter("[value=" + selectValue + "]").attr("checked", "checked");
}

function getSelectCheckbox(elemname) {
    return $("#" + elemname).is(":checked");
}

function getSelectDate(elem, gettime, format, separator, returntype) {
    gettime = (gettime == undefined) ? true : gettime;
    format = (format == undefined) ? "ymd" : format;
    separator = (separator == undefined) ? "-" : separator;
    returntype = (returntype == undefined) ? "string" : returntype;

    if ($("#txt_" + elem + "_date").val() == "") {
        return "";
    } else {
        var select_date = $("#txt_" + elem + "_date").datepicker("getDate");
        select_date.setHours($("#ddl_" + elem + "_hour").val());
        select_date.setMinutes($("#ddl_" + elem + "_min").val());
        select_date.setSeconds(0);

        if (returntype == "date") {
            return select_date;
        } else {
            return getStringDate(select_date, gettime, format, separator);
        }
    }
}

function DiffDate(date1, date2, return_type) {
    return_type = (return_type) ? return_type : "minute";

    if (date1 != "" && date2 != "") {
        var one_day = 1000 * 60 * 60 * 24;
        var one_minute = 1000 * 60;

        var diff_date = date2 - date1;
        var diff_day = diff_date / one_day;
        var diff_min = diff_date / one_minute;

        if (return_type == "day") {
            return diff_day;
        } else if (return_type == "minute") {
            return diff_min;
        } else {
            return diff_date;
        }
    } else {
        return null;
    }
}

function setNumberFormat(ovalue, point) {
    ovalue = (ovalue == undefined) ? 0 : ovalue;
    point = (point == undefined) ? 0 : point;

    format = {
        numberOfDecimals: point,
        decimalSeparator: ".",
        thousandSeparator: ",",
        symbol: ""
    };

    return $().number_format(ovalue, format);
}

function setDateTime(elem_text, elem_hour, elem_min, odate) {
    odate = (odate == undefined) ? "" : odate;

    if (odate == "") {
        $("#" + elem_text).val("");
        $("#" + elem_hour).val("00");
        $("#" + elem_min).val("00");
    } else {
        var arr_datetime = odate.split(" ");

        //set element date
        var arr_date = arr_datetime[0].split("-");
        $("#" + elem_text).val(arr_date[2] + "-" + arr_date[1] + "-" + arr_date[0]);

        //set elem time
        var arr_time = [];
        if (arr_datetime.length > 1) {
            arr_time = arr_datetime[1].split(":");

            if (elem_hour != "") {
                $("#" + elem_hour).val(arr_time[0]);
            }
            if (elem_min != "") {
                $("#" + elem_min).val(arr_time[1]);
            }
        }
    }
}

function setDatePicker(elem, settime, odate, format, separator) {
    odate = (odate == undefined) ? "" : odate;

    if (odate == "") {
        $("#txt_" + elem + "_date").val("");
        $("#ddl_" + elem + "_hour").val("00");
        $("#ddl_" + elem + "_min").val("00");
    } else {
        settime = (settime == undefined) ? true : settime;
        format = (format == undefined) ? "ymd" : format;
        separator = (separator == undefined) ? "-" : separator;

        var arr_datetime = odate.split(" ");
        var arr_date = arr_datetime[0].split("-");

        //set element date
        var strdate = "";

        if (format == "dmy") {
            strdate = arr_date[0] + "-" + arr_date[1] + "-" + arr_date[2];
        } else if (format == "mdy") {
            strdate = arr_date[1] + "-" + arr_date[0] + "-" + arr_date[2];
        } else {
            strdate = arr_date[2] + "-" + arr_date[1] + "-" + arr_date[0];
        }

        $("#txt_" + elem + "_date").val(strdate);

        if (settime) {
            //set elem time
            var arr_time = [];

            if (arr_datetime.length > 1) {
                arr_time = arr_datetime[1].split(":");

                $("#ddl_" + elem + "_hour").val(arr_time[0]);
                $("#ddl_" + elem + "_min").val(arr_time[1]);
            }
        }
    }
}

function getSMCode() {
    var req_date = new Date();
    var req_code = req_date.getTime();

    return req_code;
}

function loadListItem(postUrl, postData, elem, msg, allMsg, allValue, setValue, fieldname, fieldvalue) {
    elem = (elem.indexOf("#") == -1) ? "#" + elem : elem;
    msg = (msg == undefined || msg == "") ? "" : msg;
    allMsg = (allMsg == undefined || allMsg == "") ? "-- เลือก --" : allMsg;
    allValue = (allValue == undefined || allValue == "") ? "99999" : allValue;

    return $.ajax({
        type: "POST",
        url: postUrl,
        data: postData,
        dataType: "json",
        beforeSend: function () {
            $("#lbl_subject_right").text(msg);
            toggleLoading("show", msg);
        },
        success: function (data, textStatus, jqXHR) {

            //remove all option
            $(elem + " option").remove();

            if (data != null) {
                var dataRow = data.datarow;
                var irow = 0;
                $.each(dataRow, function (index, ovalue) {
                    //if (ovalue.id != "NODATA") {
                    if (irow == 0) {
                        $(elem + " option").remove();
                        if (allMsg != "") {
                            $(elem).append('<option value="' + allValue + '">' + allMsg + '</option>');
                        }
                    }
                    if (dataRow.length == 1) {
                        var html = '<option value="' + ovalue[fieldvalue] + '" selected>' + ovalue[fieldname] + '</option>';
                        //alert(html);
                        $(elem).append(html);

                    } else {
                        $(elem).append('<option value="' + ovalue[fieldvalue] + '">' + ovalue[fieldname] + '</option>');
                    }
                    irow++;
                    //}
                });

                if (setValue != undefined) {
                    window.setTimeout(function () {
                        //$(elem).val(setValue);
                    }, 10);
                }
            }

            $("#lbl_subject_right").text("");
            toggleLoading("hide");
        }
    });
}

function deleteMasterData(postUrl, postData) {
    return $.ajax({
        type: "POST",
        url: postUrl,
        data: postData,
        dataType: "json",
        beforeSend: function () {
            $("#lbl_subject_right").text("ลบข้อมูล ...");
            toggleLoading("show", "ลบข้อมูล ...");
        },
        success: function (data, textStatus, jqXHR) {
            if (data.errorcode == "OK") {
                alert("ลบข้อมูลเรียบร้อย !!!");
            } else if (data.errorcode == "ERROR") {
                alert("ไม่สามารถลบข้อมูลได้ !!!");
            } else if (data.errorcode == "SQLEXCEPTION") {
                alert("เกิดข้อผิดพลาดระหว่างลบข้อมูลจากฐานข้อมูล !!!");
            } else if (data.errorcode == "APPEXCEPTION") {
                alert("เกิดข้อผิดพลาดระหว่างดำเนินการลบข้อมูล !!!");
            } else {
                alert("ERROR : " + data.errorcode);
            }

            toggleLoading("hide");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Exception : " + textStatus + " [" + errorThrown + "]");
            toggleLoading("hide");
        }
    });
}

function exportExcelSimple(gridname, rptname, rptfile) {
    var gridname = (gridname.indexOf("#") == -1) ? "#" + gridname : gridname;

    var row_count = $(gridname).jqGrid("getGridParam", "records");

    if (row_count == 0) {
        alert("กรุณาค้นหาข้อมูลก่อน !!!");
        return false;
    }

    var rptcolumn = "", rptrow = "";
    var colname = $(gridname).jqGrid("getGridParam", "colNames");
    var colmodel = $(gridname).jqGrid("getGridParam", "colModel");
    var gridrow = $(gridname).getRowData();

    $.each(colmodel, function (colIdx, colValue) {
        var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
        ishidden = (colValue.name == "rn" || colValue.name == "Delete") ? true : ishidden;

        if (!ishidden) {
            if (rptcolumn == "") {
                rptcolumn = colname[colIdx];
            } else {
                rptcolumn += "|" + colname[colIdx];
            }
        }
    });
    //alert(rptcolumn);
    $.each(gridrow, function (rowIdx, rowValue) {
        var rowData = "";
        if (rowIdx > 0) {
            $.each(colmodel, function (colIdx, colValue) {
                var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
                ishidden = (colValue.name == "rn" || colValue.name == "Delete") ? true : ishidden;

                if (!ishidden) {
                    var cellValue = rowValue[colValue.name];

                    try {
                        cellValue = ($(cellValue).is("img")) ? $(cellValue).attr("title") : cellValue;
                    } catch (ex) {
                        cellValue = rowValue[colValue.name];
                    }

                    if (rowData == "") {
                        rowData = cellValue;
                    } else {
                        rowData += "|" + cellValue;
                    }
                }
            });
        }
        if (rptrow == "") {
            rptrow = rowData;
        } else {
            rptrow += "::" + rowData;
        }
    });

    //alert(rptname);
    var postData = {
        module: "exportsimple",
        rptname: rptname,
        rptfile: rptfile,
        rptcolumn: rptcolumn,
        rptrow: rptrow
    };
    //alert(rptrow);
    toggleLoading("show", "Create excel flie...");

    $.post("importServlet", postData, function (data) {
        toggleLoading("hide");
        window.open(data, "ifrm_export");
    });
}

function exportExcel(gridname, rptname, rptfile) {
    var gridname = (gridname.indexOf("#") == -1) ? "#" + gridname : gridname;

    var row_count = $(gridname).jqGrid("getGridParam", "records");

    if (row_count == 0) {
        alert("กรุณาค้นหาข้อมูลก่อน !!!");
        return false;
    }

    var rptcolumn = "", rptrow = "";
    var colname = $(gridname).jqGrid("getGridParam", "colNames");
    var colmodel = $(gridname).jqGrid("getGridParam", "colModel");
    var gridrow = $(gridname).getRowData();

    $.each(colmodel, function (colIdx, colValue) {
        var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
        ishidden = (colValue.name == "rn" || colValue.name == "Delete") ? true : ishidden;

        if (!ishidden) {
            if (rptcolumn == "") {
                rptcolumn = colname[colIdx];
            } else {
                rptcolumn += "|" + colname[colIdx];
            }
        }
    });

    $.each(gridrow, function (rowIdx, rowValue) {
        var rowData = "";

        $.each(colmodel, function (colIdx, colValue) {
            var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
            ishidden = (colValue.name == "rn" || colValue.name == "Delete") ? true : ishidden;

            if (!ishidden) {
                var cellValue = rowValue[colValue.name];

                try {
                    cellValue = ($(cellValue).is("img")) ? $(cellValue).attr("title") : cellValue;
                } catch (ex) {
                    cellValue = rowValue[colValue.name];
                }

                if (rowData == "") {
                    rowData = cellValue;
                } else {
                    rowData += "|" + cellValue;
                }
            }
        });

        if (rptrow == "") {
            rptrow = rowData;
        } else {
            rptrow += "::" + rowData;
        }
    });

    //alert(rptname);
    var postData = {
        module: "exportsimple",
        rptname: rptname,
        rptfile: rptfile,
        rptcolumn: rptcolumn,
        rptrow: rptrow
    };

    toggleLoading("show", "Create excel flie...");

    $.post("exportservlet", postData, function (data) {
        toggleLoading("hide");
        window.open(data, "ifrm_export");
    });
}

function toggleGridLoading(grdname, isshow) {
    if (isshow) {
        $("#load_" + grdname).css("display", "block");
    } else {
        $("#load_" + grdname).css("display", "none");
    }
}
;

function saveDataToDB(gridname, rptname, rptfile, brokerid, importtype) {
    var gridname = (gridname.indexOf("#") == -1) ? "#" + gridname : gridname;

    var row_count = $(gridname).jqGrid("getGridParam", "records");

    if (row_count == 0) {
        alert("กรุณาค้นหาข้อมูลก่อน !!!");
        return false;
    }

    var rptcolumn = "", rptrow = "";
    var colname = $(gridname).jqGrid("getGridParam", "colNames");
    var colmodel = $(gridname).jqGrid("getGridParam", "colModel");
    var gridrow = $(gridname).getRowData();

    $.each(colmodel, function (colIdx, colValue) {
        var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
        ishidden = (colValue.name == "rn" || colValue.name == "Delete") ? true : ishidden;

        if (!ishidden) {
            if (rptcolumn == "") {
                rptcolumn = colname[colIdx];
            } else {
                rptcolumn += "|" + colname[colIdx];
            }
        }
    });
    //alert(rptcolumn);
    $.each(gridrow, function (rowIdx, rowValue) {
        var rowData = "";
        if (rowIdx > 0) {
            $.each(colmodel, function (colIdx, colValue) {
                var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
                ishidden = (colValue.name == "rn" || colValue.name == "Delete") ? true : ishidden;

                if (!ishidden) {
                    var cellValue = rowValue[colValue.name];

                    try {
                        cellValue = ($(cellValue).is("img")) ? $(cellValue).attr("title") : cellValue;
                    } catch (ex) {
                        cellValue = rowValue[colValue.name];
                    }

                    if (rowData == "") {
                        rowData = cellValue;
                    } else {
                        rowData += "|" + cellValue;
                    }
                }
            });
        }
        if (rptrow == "") {
            rptrow = rowData;
        } else {
            rptrow += "::" + rowData;
        }
    });

    //alert(rptname);
    var postData = {
        module: "saverequestdata",
        rptname: rptname,
        rptfile: rptfile,
        rptcolumn: rptcolumn,
        rptrow: rptrow,
        brokerid: brokerid,
        importtype: importtype
    };
    //alert(rptrow);
    toggleLoading("show", "Save Data To DB...");

    $.post("importServlet", postData, function (data) {
        toggleLoading("hide");
        window.open(data, "ifrm_export");
    });
}

function disablePaste(txtbox) {
    txtbox = (txtbox == undefined) ? "" : txtbox;

    $("input[type='text'], textarea").live("cut copy paste", function (e) {
        //e.preventDefault();
    });

    return true;
}

function splitAc(val) {
    return val.split(/,\s*/);
}

function extractLast(term) {
    return splitAc(term).pop();
}

function export_excel(gridname, columnheader, columntype, rptname, rptfile) {
    var gridname = (gridname.indexOf("#") == -1) ? "#" + gridname : gridname;

    var row_count = $(gridname).jqGrid("getGridParam", "records");

    if (row_count == 0) {
        alert("กรุณาค้นหาข้อมูลก่อน !!!");
        return false;
    }

    var rptcolumn = "", rptrow = "";
    var colname = $(gridname).jqGrid("getGridParam", "colNames");
    var colmodel = $(gridname).jqGrid("getGridParam", "colModel");
    var gridrow = $(gridname).getRowData();

    $.each(colmodel, function (colIdx, colValue) {
        var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
        ishidden = (colValue.name == "rn" || colValue.name == "Delete" || colValue.name == "delete" || colValue.name == "battery") ? true : ishidden;

        if (!ishidden) {
            if (rptcolumn == "") {
                rptcolumn = colname[colIdx];
            } else {
                rptcolumn += "|" + colname[colIdx];
            }
        }
    });
    //alert(rptcolumn);
    $.each(gridrow, function (rowIdx, rowValue) {
        var rowData = "";
        if (rowIdx >= 0) {
            $.each(colmodel, function (colIdx, colValue) {
                var ishidden = (colValue.hidden == undefined) ? false : colValue.hidden;
                ishidden = (colValue.name == "rn" || colValue.name == "Delete" || colValue.name == "delete" || colValue.name == "battery") ? true : ishidden;

                if (!ishidden) {
                    var cellValue = rowValue[colValue.name];

                    try {
                        cellValue = ($(cellValue).is("img")) ? $(cellValue).attr("title") : cellValue;
                    } catch (ex) {
                        cellValue = rowValue[colValue.name];
                    }

                    if (rowData == "") {
                        rowData = cellValue;
                    } else {
                        rowData += "|" + cellValue;
                    }
                }
            });
        }
        if (rptrow == "") {
            rptrow = rowData;
        } else {
            rptrow += "::" + rowData;
        }
    });

    //alert(rptname);
    var postData = {
        rptname: rptname,
        rptfile: rptfile,
        rptcolumn: rptcolumn,
        rptrow: rptrow
    };
    //alert(rptrow);
    toggleLoading("show", "Create excel flie...");

    $.post("ws/wsExportexcel/PostProcess", postData, function (data) {
        toggleLoading("hide");
        window.open(data, "ifrm_export");


    });
}