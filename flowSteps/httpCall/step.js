/****************************************************
 Dependencies
 ****************************************************/

var httpService = dependencies.http;

/**
 * This flow step will send generic request.
 *
 * @param {object} inputs
 * {text} method, This is used to config method.
 * {text} url, This is used to config external URL.
 * {Array[string]} pathVariables, This is used to config path variables.
 * {Array[string]} headers, This is used to config headers.
 * {Array[string]} params, This is used to config params.
 * {string} body, This is used to send body request.
 * {boolean} followRedirects, This is used to config follow redirects.
 * {boolean} download, This is used to config download.
 * {boolean} fullResponse, This is used to config full response.
 * {number} connectionTimeout, Read timeout interval, in milliseconds.
 * {number} readTimeout, Connect timeout interval, in milliseconds.
 */
step.httpCall = function (inputs) {

	var inputsLogic = {
		method: inputs.method || "",
		url: inputs.url || {
			urlValue: config.get("baseUrl")+config.get("emptyPath") || "",
			paramsValue: []
		},
		headers: inputs.headers || [],
		params: inputs.params || [],
		body: inputs.body || {},
		followRedirects : inputs.advancedSettings.followRedirects || false,
		connectionTimeout: inputs.advancedSettings.connectionTimeout || 5000,
		readTimeout: inputs.advancedSettings.readTimeout || 60000
	};

	inputsLogic.headers = isObject(inputsLogic.headers) ? inputsLogic.headers : stringToObject(inputsLogic.headers);

	inputsLogic.headers = mergeJSON(inputsLogic.headers, isObject(config.get("defaultHeaders")) ? config.get("defaultHeaders") : stringToObject(config.get("defaultHeaders")));

	inputsLogic.params = isObject(inputsLogic.params) ? inputsLogic.params : stringToObject(inputsLogic.params);
	inputsLogic.body = isObject(inputsLogic.body) ? inputsLogic.body : JSON.parse(inputsLogic.body);

	var options = {
		url: parse(inputsLogic.url.urlValue, inputsLogic.url.paramsValue),
		params: inputsLogic.params,
		headers: inputsLogic.headers,
		body: inputsLogic.body,
		followRedirects : inputsLogic.followRedirects,
		connectionTimeout: inputsLogic.connectionTimeout,
		readTimeout: inputsLogic.readTimeout,
		authorization: config.get("authType") === "no" ? {} :
						config.get("authType") === "basic" ? {type: "basic", username: config.get("username"), password: config.get("password")} :
							config.get("authType") === "digest" ? {type: "digest", username: config.get("username"), password: config.get("password")} :
								config.get("authType") === "oauth2" ? {type: "oauth2", accessToken: config.get("accessToken"), headerPrefix: config.get("headerPrefix")} : {}
	}

	switch (inputs.method.toLowerCase()) {
		case 'get':
			return httpService.get(options);
		case 'post':
			return httpService.post(options);
		case 'delete':
			return httpService.delete(options);
		case 'put':
			return httpService.put(options);
		case 'connect':
			return httpService.connect(options);
		case 'head':
			return httpService.head(options);
		case 'options':
			return httpService.options(options);
		case 'patch':
			return httpService.patch(options);
		case 'trace':
			return httpService.trace(options);
	}

	return null;
};

var parse = function (url, pathVariables){

	var regex = /{([^}]*)}/g;

	if (!url.match(regex)){
		return url;
	}

	if(!pathVariables){
		sys.logs.error('No path variables have been received and the url contains curly brackets\'{}\'');
		throw new Error('Error please contact support.');
	}

	url = url.replace(regex, function(m, i) {
		return pathVariables[i] ? pathVariables[i] : m;
	})

	return url;
}

var isObject = function (obj) {
	return !!obj && stringType(obj) === '[object Object]'
}

var stringType = Function.prototype.call.bind(Object.prototype.toString)

var stringToObject = function (obj) {
	if (!!obj){
		var keyValue = obj.toString().split(',');
		var parseObj = {};
		for(var i = 0; i < keyValue.length; i++) {
			parseObj[keyValue[i].split('=')[0]] = keyValue[i].split('=')[1]
		}
		return parseObj;
	}
	return null;
}

function mergeJSON (json1, json2) {
	const result = {};
	var key;
	for (key in json1) {
		if(json1.hasOwnProperty(key)) result[key] = json1[key];
	}
	for (key in json2) {
		if(json2.hasOwnProperty(key)) result[key] = json2[key];
	}
	return result;
}
