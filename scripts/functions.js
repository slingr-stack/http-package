/****************************************************
 Dependencies
 ****************************************************/

var httpReference = dependencies.http;

var httpDependency = {
    get: httpReference.get,
    post: httpReference.post,
    put: httpReference.put,
    patch: httpReference.patch,
    delete: httpReference.delete,
    head: httpReference.head,
    options: httpReference.options
};
var httpService = {};

function handleRequestWithRetry(requestFn, options, callbackData, callbacks) {
    try {
        return requestFn(options, callbackData, callbacks);
    } catch (error) {
        sys.logs.info("[http] Handling request " + JSON.stringify(error));
    }
}

function createWrapperFunction(requestFn) {
    return function (options, callbackData, callbacks) {
        return handleRequestWithRetry(requestFn, options, callbackData, callbacks);
    };
}

for (var key in httpDependency) {
    if (typeof httpDependency[key] === 'function') httpService[key] = createWrapperFunction(httpDependency[key]);
}

exports.getAccessToken = function () {
    sys.logs.info("[http] Getting access token from oauth");
    return dependencies.oauth.functions.connectUser('http:userConnected');
}

exports.removeAccessToken = function () {
    sys.logs.info("[http] Removing access token from oauth");
    return dependencies.oauth.functions.disconnectUser('http:disconnectUser');
}

/****************************************************
 Helpers
 ****************************************************/

exports.get = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.get(http(options), callbackData, callbacks);
};

exports.post = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.post(http(options), callbackData, callbacks);
};

exports.put = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.put(http(options), callbackData, callbacks);
};

exports.patch = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.patch(http(options), callbackData, callbacks);
};

exports.delete = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.delete(http(options), callbackData, callbacks);
};

exports.head = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.head(http(options), callbackData, callbacks);
};

exports.options = function (url, httpOptions, callbackData, callbacks) {
    var options = checkHttpOptions(url, httpOptions);
    return httpService.options(http(options), callbackData, callbacks);
};

exports.utils = {};

exports.utils.parseTimestamp = function (dateString) {
    if (!dateString) {
        return null;
    }
    var dt = dateString.split(/[: T\-]/).map(parseFloat);
    return new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0, dt[5] || 0, 0);
};

exports.utils.formatTimestamp = function (date) {
    if (!date) {
        return null;
    }
    var pad = function (number) {
        var r = String(number);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    };
    return date.getUTCFullYear()
        + '-' + pad(date.getUTCMonth() + 1)
        + '-' + pad(date.getUTCDate())
        + 'T' + pad(date.getUTCHours())
        + ':' + pad(date.getUTCMinutes())
        + ':' + pad(date.getUTCSeconds())
        + '.' + String((date.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5)
        + 'Z';
};

exports.utils.fromDateToTimestamp = function (params) {
    if (!!params) {
        return {timestamp: new Date(params).getTime()};
    }
    return null;
};

exports.utils.fromMillisToDate = function (params) {
    if (!!params) {
        var sdf = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: 'UTC'
        });
        return {date: sdf.format(new Date(parseInt(params)))};
    }
    return null;
};

exports.utils.getConfiguration = function (property) {
    sys.logs.debug('[http] Get property: ' + property);
    return config.get(property);
};

exports.utils.concatQuery = function (url, key, value) {
    return url + ((!url || url.indexOf('?') < 0) ? '?' : '&') + key + "=" + value;
}

exports.utils.mergeJSON = function (json1, json2) {
    const result = {};
    var key;
    for (key in json1) {
        if (json1.hasOwnProperty(key)) result[key] = json1[key];
    }
    for (key in json2) {
        if (json2.hasOwnProperty(key)) result[key] = json2[key];
    }
    return result;
}

/****************************************************
 Private helpers
 ****************************************************/

let pkgConfig = config.get()
var http = function (options) {
    options = options || {};
    options = setApiUri(options);
    options = setRequestHeaders(options);
    options = setAuthorization(options);
    return options;
}

function setApiUri(options) {
    var api_url = pkgConfig.baseUrl || "";
    var path = options.path || pkgConfig.emptyPath || "";
    options.url = api_url + path;
    sys.logs.debug('[webflow] Set url: ' + options.path + "->" + options.url);
    return options;
}

function setRequestHeaders(options) {
    var headers = options.headers || {};
    if (pkgConfig.defaultHeaders.includes('=')){
        headers = mergeJSON(headers, convertStringToObject(pkgConfig.defaultHeaders));
    }
    if (!headers.hasOwnProperty("Content-Type")) {
        headers = mergeJSON(headers, {"Content-Type": "application/json"});
    }
    options.headers = headers;
    return options;
}

function setAuthorization(options) {
    var authorization = options.authorization || {};
    sys.logs.debug('[Gmelius] setting authorization');
    switch (pkgConfig.authType) {
        case "basic":
            authorization = mergeJSON(authorization, {
                type: "basic",
                username: pkgConfig.username,
                password: pkgConfig.password
            });
            break;
        case "digest":
            authorization = mergeJSON(authorization, {
                type: "digest",
                username: pkgConfig.username,
                password: pkgConfig.password
            });
            break;
        case "oauth2":
            authorization = mergeJSON(authorization, {
                type: "oauth2",
                accessToken: sys.storage.get(pkgConfig.id + ' - access_token',{decrypt:true}),
                headerPrefix: "Bearer"
            });
            break;
        case "no":
        default:
            break;
    }
    options.authorization = authorization;
    return options;
}

var checkHttpOptions = function (url, options) {
    options = options || {};
    if (!!url) {
        if (isObject(url)) {
            // take the 'url' parameter as the options
            options = url || {};
        } else {
            if (!!options.path || !!options.params || !!options.body) {
                // options contain the http package format
                options.path = url;
            } else {
                // create html package
                options = {
                    path: url,
                    body: options
                }
            }
        }
    }
    return options;
}

var isObject = function (obj) {
    return !!obj && stringType(obj) === '[object Object]'
}

var stringType = Function.prototype.call.bind(Object.prototype.toString)

var mergeJSON = function (json1, json2) {
    const result = {};
    var key;
    for (key in json1) {
        if (json1.hasOwnProperty(key)) result[key] = json1[key];
    }
    for (key in json2) {
        if (json2.hasOwnProperty(key)) result[key] = json2[key];
    }
    return result;
}

function convertStringToObject(inputString) {
    var pairs = inputString.split(',');
    var result = {};
    for (var i = 0; i < pairs.length; i++) {
        var keyValue = pairs[i].split('=');
        var key = keyValue[0].trim();
        var value = keyValue[1].trim();
        result[key] = value;
    }
    return result;
}