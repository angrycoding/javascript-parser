(function s(){function n(){return"function"==typeof r.define&&"function"==typeof r.define.getCurrentScript?!!r.define.getCurrentScript():void 0}function t(){return"object"==typeof r.process&&"string"==typeof r.process.version?!0:void 0}var e,r=function(){return this}.call(null),i=arguments[0],o=arguments[1];n()?define(["!global","!module"],i):t()?(e={uri:__filename},require.main===module&&(e.args=process.argv),module.exports=i(r,e)):"string"==typeof o&&(r[o]=i(r,"MODULE_BROWSER"))})(function anonymous($krang_hio56q2n5h13mf,$krang_hio56q2ok6fbzx) {
var $krang_hio56q2w3j4b4r = $krang_hio56q2n5h13mf;
var $krang_hio56q2xe0g6by = {"T_GLOBAL":1,"T_MODULE":2,"T_CONFIG":3,"T_RESOURCE":4,"T_PLATFORM":5,"T_CONTAINER":6,"KRANG_ROOT":100,"KRANG_MEMBER":101,"KRANG_PROCESS":102,"VERSION":0.2,"MSG_PREFIX":"[ KRANG ]","VAR_PREFIX":"$krang_"};
var $krang_hio56q2zjmwegi = (function () {

	var UID_TIME_LAST = 0;
	var UID_TIME_DIFF = 0;

	var URL_DIRNAME_REGEXP = /^(.*)\//;
	var FILE_TYPE_REGEXP = /.+\.([^\.]+)$/;
	var URL_PARSER_REGEXP = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;

	function removeDotSegments(path) {
		var path = path.split('/');
		var isAbsolute = (path[0] === '');
		var result = [], fragment = '';
		if (isAbsolute) path.shift();
		while (path.length) {
			fragment = path.shift();
			if (fragment === '..') {
				result.pop();
			} else if (fragment !== '.') {
				result.push(fragment);
			}
		}
		if (isAbsolute) result.unshift('');
		if (fragment === '.' || fragment === '..') result.push('');
		return result.join('/');
	}

	function isUndefined(value) {
		return (value === undefined);
	}

	function isBoolean(value) {
		return (typeof(value) === 'boolean');
	}

	function isString(value) {
		return (typeof value === 'string');
	}

	function isArray(value) {
		return (value instanceof Array);
	}

	function isObject(value) {
		return (value instanceof Object);
	}

	function isFunction(value) {
		return (value instanceof Function);
	}

	function isMap(value) {
		return (
			value instanceof Object &&
			!(value instanceof Function) &&
			!(value instanceof Array)
		);
	}

	function toMap(value) {
		return (isMap(value) ? value : {});
	}

	function toFunction(value) {
		return (isFunction(value) ? value : function(){});
	}

	function forEachAsync(collection, iterator, ret, thisArg) {

		var keys, key, length, c = -1,
			ret = toFunction(ret),
			calls = 0, looping = false;

		if (!isObject(collection) ||
			!isFunction(iterator)) {
			return ret.call(thisArg);
		}

		if (isArray(collection)) {
			length = collection.length;
		} else {
			keys = Object.keys(collection);
			length = keys.length;
		}

		(function resume() {
			calls += 1;
			if (looping) return;
			looping = true;
			while (calls > 0) {
				calls -= 1, c += 1;
				if (c === length) return ret.call(thisArg);
				key = (keys ? keys[c] : c);
				iterator.call(thisArg, collection[key], function(stop) {
					if (stop === true) ret.call(thisArg);
					else resume();
				}, key);
			}
			looping = false;
		})();

	}

	function mapAsync(collection, iterator, ret, thisArg) {

		if (isUndefined(collection)) collection = [];
		if (!isObject(collection)) collection = [collection];

		var ret = toFunction(ret),
			length, result,
			keys = null;


		if (isMap(collection)) {
			keys = Object.keys(collection);
			length = keys.length;
			result = {};
		} else if (isArray(collection)) {
			length = collection.length;
			result = new Array(length);
		}

		if (isFunction(iterator) && length) {
			for (var key, c = 0, toLoad = length; c < length; c++) {
				key = (keys ? keys[c] : c);
				iterator.call(thisArg, collection[key], function(key) {
					return function(value) {
						result[key] = value;
						if (--toLoad) return;
						ret.call(thisArg, result);
					};
				}(key), key);
			}
		} else ret.call(thisArg, result);
	}

	function hasOwnProperty(value, name) {
		return (value !== null &&
			value !== undefined && typeof name === 'string' &&
			Object.prototype.hasOwnProperty.call(value, name));
	}

	function uniqueId(prefix) {
		if (!isString(prefix)) prefix = '';
		var partOne = new Date().getTime();
		if (partOne > UID_TIME_LAST) UID_TIME_DIFF = 0;
		else partOne += (++UID_TIME_DIFF);
		UID_TIME_LAST = partOne;
		return (prefix + partOne.toString(36) +
			(1 + Math.floor((Math.random() * 32767))).toString(36) +
			(1 + Math.floor((Math.random() * 32767))).toString(36)
		);
	}

	function string_trim(value) {
		if (!isString(value)) return '';
		value = value.replace(/^\s+/, '');
		value = value.replace(/\s+$/, '');
		return value;
	}

	function string_startsWith(value, search, ignoreCase) {
		if (!isString(value)) return false;
		if (!isString(search)) return false;
		var fragment = value.substr(0, search.length);
		if (ignoreCase) {
			search = search.toLowerCase();
			fragment = fragment.toLowerCase();
		}
		return (search === fragment);
	}

	function object_clone(value) {
		if (isMap(value)) {
			var result = {};
			for (var key in value)
				result[key] = object_clone(value[key]);
			return result;
		} else if (isArray(value)) {
			var result = new Array(value.length);
			for (var c = 0; c < value.length; c++)
				result[c] = object_clone(value[c]);
			return result;
		} else return value;
	}

	function object_merge() {
		var c, key, value;
		var result = {}, object;
		var length = arguments.length;
		for (c = 0; c < length; c++) {
			if (!isMap(object = arguments[c])) continue;
			for (key in object) {
				if (!hasOwnProperty(object, key)) continue;
				if (isUndefined(value = object[key])) {
					if (hasOwnProperty(result, key))
						delete result[key];
				} else if (hasOwnProperty(result, key) &&
					isMap(result[key]) && isMap(value)) {
					result[key] = object_merge(result[key], value);
				} else if (isMap(value)) {
					result[key] = object_merge(value);
				} else result[key] = value;
			}
		}
		return result;
	}

	function uri_parse(uri) {
		if (!isString(uri)) return {};
		var result = uri.match(URL_PARSER_REGEXP);
		var scheme = (result[1] || '').toLowerCase();
		var authority = (result[2] || '').toLowerCase();
		var path = (result[3] || '');
		var fileName = (path.split('/').pop());
		var fileType = fileName.match(FILE_TYPE_REGEXP);
		fileType = (fileType && fileType[1] || '');
		if (scheme === 'http' && authority.slice(-3) === ':80')
			authority = authority.slice(0, -3);
		else if (scheme === 'https' && authority.slice(-4) === ':443')
			authority = authority.slice(0, -4);
		return {
			scheme: scheme, authority: authority,
			path: path, fileName: fileName, fileType: fileType,
			query: (result[4] || ''), fragment: (result[5] || '')
		};
	}

	function uri_parseQuery(query) {
		var result = {};
		if (!isString(query)) return {};
		query.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
			function($0, $1, $2, $3) { result[$1] = $3; });
		return result;
	}

	function uri_format(uri) {
		if (!isMap(uri)) return '';
		return ((uri.scheme ? uri.scheme + '://' : '') +
			(uri.authority ? uri.authority : '') +
			(uri.path ? uri.path : '') +
			(uri.query ? '?' + uri.query : '') +
			(uri.fragment ? '#' + uri.fragment : ''));
	}

	function uri_formatQuery(query) {
		var queryArr = [], key;
		if (!isMap(query)) return '';
		for (key in query) {
			if (!query.hasOwnProperty(key)) continue;
			queryArr.push(key + '=' + query[key]);
		}
		return queryArr.join('&');
	}

	function uri_resolve(uri, base) {
		var relUri = uri;
		var baseUri = base;
		if (isString(relUri)) relUri = uri_parse(relUri);
		if (isString(baseUri)) baseUri = uri_parse(baseUri);
		var res = '', ts = '';
		if (relUri.scheme) {
			res += (relUri.scheme + ':');
			if (ts = relUri.authority) res += ('//' + ts);
			if (ts = removeDotSegments(relUri.path)) res += ts;
			if (ts = relUri.query) res += ('?' + ts);
		} else {
			if (ts = baseUri.scheme) res += (ts + ':');
			if (ts = relUri.authority) {
				res += ('//' + ts);
				if (ts = removeDotSegments(relUri.path || '')) res += ts;
				if (ts = relUri.query) res += ('?' + ts);
			} else {
				if (ts = baseUri.authority) res += ('//' + ts);
				if (ts = relUri.path) {
					if (ts = removeDotSegments(ts.charAt(0) === '/' ? ts : (
						baseUri.authority && !baseUri.path ? '/' :
						(baseUri.path.match(URL_DIRNAME_REGEXP) || [''])[0]
					) + ts)) res += ts;
					if (ts = relUri.query) res += ('?' + ts);
				} else {
					if (ts = baseUri.path) res += ts;
					if ((ts = relUri.query) ||
						(ts = baseUri.query)) res += ('?' + ts);
				}
			}
		}
		if (ts = relUri.fragment) res += ('#' + ts);
		return res;
	}

	function uri_query(uri, query) {
		var uri = uri_parse(uri);
		uri.query = uri_formatQuery(
			object_merge(
				uri_parseQuery(uri.query),
				toMap(query)
			)
		);
		return uri_format(uri);
	}

	return {

		isUndefined: isUndefined,
		isBoolean: isBoolean,
		isString: isString,
		isArray: isArray,
		isObject: isObject,
		isFunction: isFunction,
		isMap: isMap,
		toMap: toMap,
		toFunction: toFunction,
		forEachAsync: forEachAsync,
		mapAsync: mapAsync,
		hasOwnProperty: hasOwnProperty,
		uniqueId: uniqueId,

		string: {
			trim: string_trim,
			startsWith: string_startsWith
		},

		object: {
			clone: object_clone,
			merge: object_merge
		},

		uri: {
			parse: uri_parse,
			parseQuery: uri_parseQuery,
			format: uri_format,
			formatQuery: uri_formatQuery,
			resolve: uri_resolve,
			query: uri_query
		}

	};

})();
var $krang_hio56q30jptjiu = (function (Utils, Constants) {

	var HASH_POOL = {};
	var VAR_PREFIX = Constants.VAR_PREFIX;

	function generateID() {
		var hash = Array.prototype.join.call(arguments);
		if (!hash) return Utils.uniqueId(VAR_PREFIX);
		if (HASH_POOL.hasOwnProperty(hash)) return HASH_POOL[hash];
		return (HASH_POOL[hash] = Utils.uniqueId(VAR_PREFIX));
	}

	return generateID;

})($krang_hio56q2zjmwegi,$krang_hio56q2xe0g6by);
var $krang_hio56q31b6o2cl = (function (Utils) {

	var exceptions = [];

	function KrangException(baseURI, message) {
		this.baseURI = baseURI;
		this.message = message;
	}

	function exception2string(exception) {
		if (Utils.isString(exception)) {
			return exception;
		}

		else if (exception instanceof Error) {
			return exception.message;
		}

		else if (exception instanceof KrangException) {
			return (exception.message + ' in ' + exception.baseURI);
		}

		else return String(exception);
	}

	function dump() {
		var exception;
		while (exceptions.length) {
			exception = exceptions.shift();
			console.error('[ ERROR ]', exception2string(exception));
		}
	}


	function IOException(baseURI, resourceURI, exception) {
		exceptions.push([baseURI, resourceURI, exception, 'IOException']);
	}

	function ScriptException(baseURI, scriptURI, exception) {
		exceptions.push([baseURI, scriptURI, exception, 'ScriptException']);
	}

	function UnsupportedURI(baseURI, uri) {
		exceptions.push(new KrangException(baseURI, 'unsupported uri: ' + uri));
	}

	function UnknownPlugin(baseURI, pluginName) {
		exceptions.push(new KrangException(baseURI, 'unknown system plugin: ' + pluginName));
	}

	function UnresolvedAlias(baseURI, alias) {
		exceptions.push(new KrangException(baseURI, 'unresolved alias: ' + alias));
	}

	function InvalidDependency(baseURI, dependencyURI) {
		exceptions.push(new KrangException(baseURI, 'invalid dependency type: ' + dependencyURI));
	}

	function CircularReference(baseURI, dependencyURI) {
		exceptions.push(new KrangException(baseURI, 'REFERS BACK TO:' + dependencyURI));
	}

	return {
		dump: dump,
		IOException: IOException,
		ScriptException: ScriptException,
		UnsupportedURI: UnsupportedURI,
		UnknownPlugin: UnknownPlugin,
		UnresolvedAlias: UnresolvedAlias,
		InvalidDependency: InvalidDependency,
		CircularReference: CircularReference
	};

})($krang_hio56q2zjmwegi);
var $krang_hio56q3b2y7bp1 = (function (Utils, StackTrace) {

	var RES_IDLE = 0;
	var RES_LOADING = 1;
	var RES_LOADED = 2;
	var SLOTS = {};

	function ResourceCache(slotID) {

		var RESOURCES = (
			SLOTS.hasOwnProperty(slotID) ?
			SLOTS[slotID] : SLOTS[slotID] = {}
		);

		function getResource(resourceID) {
			if (!Utils.isString(resourceID)) resourceID = '';
			return (
				RESOURCES.hasOwnProperty(resourceID)
				? RESOURCES[resourceID]
				: RESOURCES[resourceID] = {
					uses: {},
					status: RES_IDLE,
					waiting: []
				}
			);
		}

		function isCircular(resID1, resID2) {
			if (resID1 === resID2) return true;
			for (var resID in RESOURCES[resID1].uses) {
				if (!isCircular(resID, resID2)) continue;
				return true;
			}
		}

		function loadResource(resource, resourceData) {
			resource.data = resourceData;
			resource.status = RES_LOADED;
			var waiting = resource.waiting;
			while (waiting.length) {
				waiting.shift()(
					resourceData
				);
			}
		}

		function load(parentID, resourceID, listener, loader) {

			var resource = getResource(resourceID);

			if (resource.status === RES_LOADED)
				return listener(resource.data);

			if (listener) resource.waiting.push(listener);

			if (Utils.isString(parentID)) {
				getResource(parentID).uses[resourceID] = true;
				if (isCircular(resourceID, parentID)) {
					StackTrace.CircularReference(parentID, resourceID);
					return loadResource(resource);
				}
			}

			if (resource.status !== RES_LOADING) {
				resource.status = RES_LOADING;
				if (!loader) loadResource(resource);
				else loader(parentID, resourceID, function(resourceData) {
					loadResource(resource, resourceData);
				});
			}

		}

		function get(resourceID) {
			return getResource(resourceID).data;
		}

		return {
			load: load,
			get: get
		};
	}



	return ResourceCache;

})($krang_hio56q2zjmwegi,$krang_hio56q31b6o2cl);
var $krang_hio56q369yi210 = (function (Global, Utils, IDPool, Constants, StackTrace) {

	var head, scripts,
		browserInfo, XMLHTTPFactories,
		KRANG_PROCESS = IDPool(Constants.KRANG_PROCESS);

	function getCurrentScriptXHR() {
		var caller = arguments.callee;
		while (caller = caller.caller) {
			if (caller.hasOwnProperty(KRANG_PROCESS)) {
				return caller;
			}
		}
	}

	function getCurrentScriptNative(getOwner) {
		if (Global.document &&
			Global.document.currentScript) {
			return Global.document.currentScript;
		}
	}

	function getCurrentScriptStack(getOwner) {
		try { throw new Error(); } catch (exception) {
			if (!exception.stack) return;
			var caller = exception.stack;
			if (caller.indexOf('@') === -1) {
				caller = caller.split('\n').pop();
				caller = caller.split(' ').pop();
			} else caller = caller.split('@').pop();
			caller = caller.split(/(\:\d+)+\s*$/).shift();
			for (var script, c = 0; c < scripts.length; c++) {
				script = scripts[c];
				if (script.src !== caller) continue;
				if (getOwner || script.hasOwnProperty(KRANG_PROCESS)) {
					return script;
				}
			}
		}
	}

	function getCurrentScriptInteractive(getOwner) {
		for (var script, c = 0; c < scripts.length; c++) {
			script = scripts[c];
			if (script.readyState !== 'interactive') continue;
			if (getOwner || script.hasOwnProperty(KRANG_PROCESS)) {
				return script;
			}
		}
	}

	function createXMLHTTPObject() {
		var XMLHTTPFactory = false;
		for (var c = 0; c < XMLHTTPFactories.length; c++) {
			try {
				XMLHTTPFactory = XMLHTTPFactories[c]();
				break;
			} catch (exception) {}
		}
		return XMLHTTPFactory;
	}

	function isSameOrigin(uri1, uri2) {
		var uri1 = Utils.uri.parse(uri1);
		var uri2 = Utils.uri.parse(uri2);
		return (uri1.scheme == uri2.scheme &&
			uri1.authority === uri2.authority);
	}

	function getBrowserInfo() {
		var browserInfo = {'browser': true};
		var versionStr, userAgent = Global.window.navigator.userAgent;
		if (versionStr = userAgent.match(/AppleWebKit\/([\d.]+)/)) {
			browserInfo['webkit'] = {'version': parseFloat(versionStr[1])};
			if (versionStr = userAgent.match(/Chrome\/([\d.]+)/))
				browserInfo['chrome'] = {'version': parseFloat(versionStr[1])};
			else if (versionStr = userAgent.match(/Version\/([\d.]+)/))
				browserInfo['safari'] = {'version': parseFloat(versionStr[1])};
		} else if (versionStr = userAgent.match(/Gecko\/([\d.]+)/)) {
			browserInfo['gecko'] = {'version': parseFloat(versionStr[1])};
			if (versionStr = userAgent.match(/Firefox\/([\d.]+)/))
				browserInfo['firefox'] = {'version': parseFloat(versionStr[1])};
		} else if (versionStr = userAgent.match(/MSIE\s([\d.]+)/)) {
			browserInfo['ie'] = {'version': parseFloat(versionStr[1])};
		} else if (versionStr = userAgent.match(/Opera\/([\d.]+)/)) {
			browserInfo['opera'] = {'version': parseFloat(versionStr[1])};
			if (versionStr = userAgent.match(/Version\/([\d.]+)/))
				browserInfo['opera'] = {'version': parseFloat(versionStr[1])};
		}
		return browserInfo;
	}

	function doScriptRequest(baseURI, requestURI, done, fail) {
		var runner = document.createElement('script');
		runner.setAttribute('type', 'text/javascript');
		runner.setAttribute('async', 'async');
		runner.setAttribute('src', requestURI);
		runner[KRANG_PROCESS] = {uri: requestURI, done: done, define: false};
		runner.onload = function() { if (!runner[KRANG_PROCESS].define) done([]); };
		runner.onerror = function() { StackTrace.IOException(baseURI, requestURI); fail(); };
		head[0].appendChild(runner);
	}

	function doXMLHTTPRequest(baseURI, requestURI, done, fail) {
		var request = createXMLHTTPObject();
		if (!request) return doScriptRequest(baseURI, requestURI, done, fail);
		try {
			request.open('GET', requestURI, true);
			request.onreadystatechange = function() {
				if (request.readyState !== 4) return;
				if (request.status === 200) {

					try {
						var runner = new Function(request.responseText);
						runner[KRANG_PROCESS] = {uri: requestURI, done: done, define: false};
						try {
							runner();
							if (!runner[KRANG_PROCESS].define) done([]);
						} catch (exception) {
							StackTrace.ScriptException(
								baseURI,
								requestURI,
								exception
							);
							fail();
						}
					} catch (exception) {
						StackTrace.ScriptException(
							baseURI,
							requestURI,
							exception
						);
						fail();
					}

				} else {
					StackTrace.IOException(baseURI, requestURI);
					fail();
				}
			};
			request.send(null);
		} catch (exception) {
			StackTrace.IOException(requestURI, exception);
			fail();
		}
	}

	function Browser() {
		head = document.getElementsByTagName('head');
		scripts = document.getElementsByTagName('script');
		XMLHTTPFactories = [
			function() { return new XMLHttpRequest(); },
			function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
			function() { return new ActiveXObject('Msxml3.XMLHTTP'); },
			function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
		];
	}

	Browser.prototype.message = function(args) {
		console.log(args);
	};

	Browser.prototype.getInfo = function() {
		if (browserInfo) return browserInfo;
		return (browserInfo = getBrowserInfo());
	};

	Browser.prototype.getBaseURI = function() {
		return Global.location.href;
	};

	Browser.prototype.getCurrentScript = function(getOwner) {
		return (
			getCurrentScriptXHR() ||
			getCurrentScriptNative(getOwner) ||
			getCurrentScriptStack(getOwner) ||
			getCurrentScriptInteractive(getOwner)
		);
	};

	Browser.prototype.boot = function(Context) {

		var config = null, require = null,
			execute = null, currentScript;

		if (currentScript = (
			getCurrentScriptNative(true) ||
			getCurrentScriptStack(true) ||
			getCurrentScriptInteractive(true))) {

			if (config = currentScript.getAttribute('data-config')) try {
				config = JSON.parse(config);
				Context = Context(config);
			} catch (exception) {
				console.error('CONFIGURATION ERROR????');
			}

			require = currentScript.getAttribute('data-require');
			execute = currentScript.innerHTML;
		}

		if (Utils.isString(execute)) try {
			execute = new Function('krang,main', execute);
		} catch (exception) {
			StackTrace.ScriptException(baseURI, null, exception);
		}

		if (Utils.isString(require)) {
			Context.require(require, function(result) {
				if (execute) execute.call(Global, Context, result);
			});
		} else if (Utils.isFunction(execute)) try {
			execute.call(Global, Context);
		} catch (exception) {
			StackTrace.ScriptException(baseURI, null, exception);
		}

		StackTrace.dump();


		return Context;
	};

	Browser.prototype.load = function(config, baseURI, requestURI, done, fail) {
		if (config.xhr && isSameOrigin(this.getBaseURI(), requestURI)) {
			doXMLHTTPRequest(baseURI, requestURI, done, fail);
		} else doScriptRequest(baseURI, requestURI, done, fail);
	};

	if (typeof Global.window === 'object' &&
		typeof Global.window.navigator === 'object' &&
		typeof Global.window.navigator.userAgent === 'string') {
		return Browser;
	}

})($krang_hio56q2w3j4b4r,$krang_hio56q2zjmwegi,$krang_hio56q30jptjiu,$krang_hio56q2xe0g6by,$krang_hio56q31b6o2cl);
var $krang_hio56q371vt8g8 = $krang_hio56q2ok6fbzx;
var $krang_hio56q38jpv61z = (function (Global, Module, Utils, IDPool, Constants, StackTrace) {

	var URL, HTTP, HTTPS, FS,
		KRANG_ROOT = IDPool(Constants.KRANG_ROOT),
		KRANG_MEMBER = IDPool(Constants.KRANG_MEMBER),
		KRANG_PROCESS = IDPool(Constants.KRANG_PROCESS);

	function executeScript(baseURI, requestURI, code, done, fail) {
		try {
			var runner =  eval('(function() {' + code + '})');
			runner[KRANG_PROCESS] = {uri: requestURI, done: done, define: false};
			try {
				runner();
				if (!runner[KRANG_PROCESS].define) done([]);
			} catch (exception) {
				StackTrace.ScriptException(baseURI, requestURI, exception);
				fail();
			}
		} catch (exception) {
			StackTrace.ScriptException(baseURI, requestURI, exception);
			fail();
		}
	}

	function doFileRequest(driver, baseURI, requestURI, done, fail) {
		requestURI = Utils.uri.parse(requestURI).path;
		driver.readFile(requestURI, function(error, data) {
			if (!error) return executeScript(baseURI, requestURI, data, done, fail);
			StackTrace.IOException(baseURI, requestURI, error);
			fail();
		});
	}

	function doHTTPRequest(driver, baseURI, requestURI, done, fail) {

		var requestObj = Utils.uri.parse(requestURI);

		driver.request({

			method: 'GET',

			path: [
				requestObj.path,
				requestObj.query
			].join('?'),

			hostname: requestObj.authority

		}, function(response) {

			if (response.statusCode > 300 &&
				response.statusCode < 400 &&
				response.headers.location) {

				var toURI = URL.parse(response.headers.location);
				if (!toURI.port) toURI.port = requestObj.port;
				if (!toURI.host) toURI.host = requestObj.host;
				if (!toURI.hostname) toURI.hostname = requestObj.hostname;
				if (!toURI.protocol) toURI.protocol = requestObj.protocol;
				return doHTTPRequest(driver, baseURI, toURI, success, fail);

			}

			var data = '';
			response.on('end', function() {
				executeScript(baseURI, requestURI, data, done, fail);
			}).on('data', function(chunk) { data += chunk; });

		})

		.on('error', function(error) {
			StackTrace.IOException(baseURI, requestURI, error);
			fail();
		})

		.end();
	}

	function Node(platform) {
		URL = require('url');
		this.platform = platform;
	}

	Node.prototype.getInfo = function() {
		var versionStr = Global.process.version;
		versionStr = versionStr.match(/\d+\.\d+[\.\d+]*/);
		return {'nodejs': true, 'version': parseFloat(versionStr[0])};
	};

	Node.prototype.message = function(args) {
		console.log(args);
	};

	Node.prototype.getBaseURI = function() {
		return (
			module.parent ?
			module.parent.filename :
			__filename
		);
	};

	Node.prototype.getCurrentScript = function() {

		var deepLevel = 1;
		var caller = arguments.callee;
		while (caller = caller.caller) {
			deepLevel++;
			if (caller.hasOwnProperty(KRANG_MEMBER)) {
				break;
			}
		}

		try { throw new Error(); } catch (exception) {
			if (!exception.stack) return;
			var caller = exception.stack;
			caller = caller.split('\n');
			if (caller[deepLevel + 1].indexOf(__filename) !== -1) {
				caller = arguments.callee;
				while (caller = caller.caller) {
					if (caller.hasOwnProperty(KRANG_PROCESS)) {
						return caller;
					} else if (caller.hasOwnProperty(KRANG_ROOT)) {
						break;
					}
				}
			}
		}
	};


	Node.prototype.load = function(config, baseURI, requestURI, done, fail) {
		var requestObj = Utils.uri.parse(requestURI);
		var requestScheme = (requestObj.scheme || 'file');
		switch (requestScheme) {
			case 'http': return doHTTPRequest(
				HTTP = HTTP || require('http'),
				baseURI, requestURI, done, fail
			);
			case 'https': return doHTTPRequest(
				HTTPS = HTTPS || require('https'),
				baseURI, requestURI, done, fail
			);
			case 'file': return doFileRequest(
				FS = FS || require('fs'),
				baseURI, requestURI, done, fail
			);
			default: {
				StackTrace.UnsupportedURI(baseURI, requestURI);
				fail();
			}
		}
	};

	Node.prototype.boot = function(Context) {

		if (!Module.hasOwnProperty('args')) return;

		var platform = this.platform,
			FileSystem = require('fs'),
			sourceFile = Module.args[2],
			targetFile = Module.args[3],
			buildContext = Context({debug: true});


		platform.message(' ___   _  ______    _______  __    _  _______ ');
		platform.message('|   | | ||    _ |  |   _   ||  |  | ||       |');
		platform.message('|   |_| ||   | ||  |  |_|  ||   |_| ||    ___|');
		platform.message('|      _||   |_||_ |       ||       ||   | __ ');
		platform.message('|     |_ |    __  ||       ||  _    ||   ||  |');
		platform.message('|    _  ||   |  | ||   _   || | |   ||   |_| |');
		platform.message('|___| |_||___|  |_||__| |__||_|  |__||_______|');


		platform.message('VERSION:', Constants.VERSION);

		if (sourceFile) {
			sourceFile = Utils.uri.resolve(sourceFile, __filename);
			platform.message('source file:', sourceFile);
		}

		if (targetFile) {
			targetFile = Utils.uri.resolve(targetFile, __filename);
			platform.message('target file:', targetFile);
		}

		buildContext.require('!build:Histone!' + sourceFile, function(result) {

			if (!targetFile) return console.info(result);
			FileSystem.writeFile(targetFile, result, function() {
				platform.message('done building', targetFile);
			});


		});

	};

	if (typeof Global.process === 'object' &&
		typeof Global.process.version === 'string') {
		return Node;
	}

})($krang_hio56q2w3j4b4r,$krang_hio56q371vt8g8,$krang_hio56q2zjmwegi,$krang_hio56q30jptjiu,$krang_hio56q2xe0g6by,$krang_hio56q31b6o2cl);
var $krang_hio56q39hbf5qj = (function (Global, Constants, Utils, Browser, Node) {

	var Platforms = [Browser, Node],
		MSG_PREFIX = Constants.MSG_PREFIX;

	function Platform() {
		for (var Platform, c = 0; c < Platforms.length; c++) {
			if (Platform = Platforms[c]) {
				this.platform = new Platform(this);
				break;
			}
		}
	}

	Platform.prototype.boot = function(Context) {
		var bootContext = this.platform.boot(Context);
		return (bootContext || Context);
	};

	Platform.prototype.message = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(MSG_PREFIX);
		this.platform.message(args.join(' '));
	};

	Platform.prototype.getInfo = function() {
		return this.platform.getInfo();
	};

	Platform.prototype.getBaseURI = function() {
		return this.platform.getBaseURI();
	};

	Platform.prototype.getCurrentScript = function() {
		return this.platform.getCurrentScript();
	};

	Platform.prototype.load = function(config, baseURI, requestURI, done, fail) {

		var config = Utils.toMap(config),
			done = Utils.toFunction(done),
			fail = Utils.toFunction(fail);

		if (!Utils.isString(requestURI)) return fail();

		if (!config.cache) {
			requestURI = Utils.uri.query(requestURI, {
				'krang.nocache': Math.floor(new Date().getTime() / 10000)
			});
		}

		this.platform.load(config, baseURI, requestURI, done, fail);
	};

	return new Platform();

})($krang_hio56q2w3j4b4r,$krang_hio56q2xe0g6by,$krang_hio56q2zjmwegi,$krang_hio56q369yi210,$krang_hio56q38jpv61z);
var $krang_hio56q3cibdmg = (function (Utils, Constants, StackTrace, IDPool, CachePool, Platform) {

	var T_GLOBAL = Constants.T_GLOBAL,
		T_MODULE = Constants.T_MODULE,
		T_CONFIG = Constants.T_CONFIG,
		T_RESOURCE = Constants.T_RESOURCE,
		T_PLATFORM = Constants.T_PLATFORM,
		T_CONTAINER = Constants.T_CONTAINER,
		ParserCache = CachePool('parser');

	function resolveDependencyURI(dependencyURI, baseURI) {
		var dependencyURI = Utils.uri.parse(dependencyURI);
		dependencyURI.fragment = '';
		dependencyURI.path = dependencyURI.path.replace(/\/+/g, '/');
		if (dependencyURI.fileName && !dependencyURI.fileType)
			dependencyURI.path += '.js';
		return Utils.uri.resolve(dependencyURI, baseURI);
	}

	return function(config, dependencies, ret) {

		function loadResource(baseURI, resourceURI, ret) {
			if (config.debug) Platform.message('loading', resourceURI);
			Platform.load(config, baseURI, resourceURI, function(args) {
				var deps, def = args.shift();
				if (args.length) { deps = def; def = args.shift(); }
				parseDependencies(resourceURI, deps, function(deps) {
					ret([deps, def]);
				});
			}, ret);
		}

		function parseSystemDependency(baseURI, dependencyURI, ret) {

			var pluginName = dependencyURI[0];

			if (pluginName === 'global') {
				ret({
					id: IDPool(T_GLOBAL, dependencyURI),
					type: T_GLOBAL,
					base: baseURI,
					data: dependencyURI
				});
			}

			else if (pluginName === 'module') {
				ret({
					id: IDPool(T_MODULE, baseURI, dependencyURI),
					type: T_MODULE,
					base: baseURI,
					data: dependencyURI
				});
			}

			else if (pluginName === 'platform') {
				ret({
					id: IDPool(T_PLATFORM, dependencyURI),
					type: T_PLATFORM,
					base: baseURI,
					data: dependencyURI
				});
			}

			else if (pluginName === 'config') {
				ret({
					id: IDPool(),
					type: T_CONFIG,
					base: baseURI,
					data: dependencyURI
				});
			}

			else if (pluginName === 'build' ||
				Utils.string.startsWith(pluginName, 'build:')) {
				var exportAs = (pluginName.split(':')[1] || '');

				parseDependencyString(
					baseURI,
					dependencyURI.slice(1).join('!'),
					function(r) {

						ret({
							id: IDPool(9999, baseURI, dependencyURI),
							type: 9999,
							base: baseURI,
							exportAs: exportAs,
							data: r
						});

					}
				);

			}

			else {
				StackTrace.UnknownPlugin(baseURI, pluginName);
				ret();
			}
		}

		function parseDependencyAlias(baseURI, dependencyURI, pluginURI, ret) {
			if (Utils.hasOwnProperty(config, 'packages') &&
				Utils.hasOwnProperty(config.packages, dependencyURI)) {
				dependencyURI = config.packages[dependencyURI];
				if (pluginURI) dependencyURI += ('!' + pluginURI);
				return parseDependencyString(baseURI, dependencyURI, ret);
			} else {
				StackTrace.UnresolvedAlias(baseURI, dependencyURI);
				ret();
			}
		}

		function parseDependencyString(baseURI, dependencyURI, ret) {

			var dependencyURI = Utils.string.trim(dependencyURI),
				pluginURI = dependencyURI.replace(/\s*!+\s*/g, '!').split('!');

			if (dependencyURI = pluginURI.shift()) {
				pluginURI = pluginURI.join('!');

				if (dependencyURI[0] === '@') {
					dependencyURI = dependencyURI.substr(1);
					return parseDependencyAlias(baseURI, dependencyURI, pluginURI, ret);
				}

				dependencyURI = resolveDependencyURI(dependencyURI, baseURI);
				ParserCache.load(baseURI, dependencyURI, function(result) {
					ret(Utils.isArray(result) ? {
						id: IDPool(T_RESOURCE, dependencyURI, pluginURI),
						type: T_RESOURCE,
						base: baseURI,
						uri: dependencyURI,
						data: pluginURI
					} : undefined);
				}, loadResource);
			}

			else parseSystemDependency(baseURI, pluginURI, ret);
		}

		function parseDependencyMap(baseURI, dependencies, ret) {
			Utils.mapAsync(dependencies, function(dependency, ret) {
				parseDependency(baseURI, dependency, ret);
			}, function(dependencies) {
				ret({type: T_CONTAINER, data: dependencies});
			});
		}

		function parseDependencyArray(baseURI, dependencies, ret) {
			var targetDependency;
			Utils.forEachAsync(dependencies, function(dependency, ret) {
				parseDependency(baseURI, dependency, function(sourceDependency) {
					if (Utils.isMap(sourceDependency) &&
						Utils.isString(sourceDependency.id)) {
						targetDependency = sourceDependency;
						ret(true);
					} else ret();
				});
			}, function() { ret(targetDependency); });
		}

		function parseDependency(baseURI, dependencyURI, ret) {
			if (Utils.isString(dependencyURI))
				parseDependencyString(baseURI, dependencyURI, ret);
			else if (Utils.isArray(dependencyURI))
				parseDependencyArray(baseURI, dependencyURI, ret);
			else if (Utils.isObject(dependencyURI))
				parseDependencyMap(baseURI, dependencyURI, ret);
			else {
				StackTrace.InvalidDependency(baseURI, dependencyURI);
				ret();
			}
		}

		function parseDependencies(baseURI, dependencies, ret) {
			Utils.mapAsync(dependencies, function(dependency, ret) {
				parseDependency(baseURI, dependency, ret);
			}, ret);
		}

		parseDependencies(config.baseURI, dependencies, ret);

	};

})($krang_hio56q2zjmwegi,$krang_hio56q2xe0g6by,$krang_hio56q31b6o2cl,$krang_hio56q30jptjiu,$krang_hio56q3b2y7bp1,$krang_hio56q39hbf5qj);
var $krang_hio56q3d69lkx5 = (function (Global, Utils, Constants, StackTrace, CachePool, IDPool, Platform) {

	var T_GLOBAL = Constants.T_GLOBAL,
		T_MODULE = Constants.T_MODULE,
		T_CONFIG = Constants.T_CONFIG,
		T_RESOURCE = Constants.T_RESOURCE,
		T_PLATFORM = Constants.T_PLATFORM,
		T_CONTAINER = Constants.T_CONTAINER,

		GLOBAL_VAR = IDPool(),
		MODULE_VAR = IDPool(),

		ParserCache = CachePool('parser'),
		EvaluatorCache = CachePool('evaluator');



	function serialize(def, deps) {
		if (Utils.isFunction(def)) {
			return '(' + String(def) + ')(' + deps + ')';
		} else if (Utils.isUndefined(def)) {
			return 'undefined';
		} else return JSON.stringify(def);
	}

	function buildOutput(type, exportAs, data) {
		if (type === 'value') {
			return (
				'var ' + exportAs + ' = ' + data + ';'
			);
		}
		else if (type === 'global') {
			return (
				'var ' + exportAs + ' = ' + GLOBAL_VAR + ';'
			);
		}
		else if (type === 'module') {
			return (
				'var ' + exportAs + ' = ' + MODULE_VAR + ';'
			);
		}
	}

	function BuildTemplate() {

		var Module, Global = function() { return this; }.call(null),
			definition = arguments[0], namespace = arguments[1];

		function isKrangJS() {
			if (typeof Global.define === 'function' &&
				typeof Global.define.getCurrentScript === 'function') {
				return (!!Global.define.getCurrentScript());
			}
		}

		function isNodeJS() {
			if (typeof Global.process === 'object' &&
				typeof Global.process.version === 'string') {
				return true;
			}
		}

		if (isKrangJS()) {
			define(['!global', '!module'], definition);
		}

		else if (isNodeJS()) {
			Module = {uri: __filename};
			if (require.main === module)
				Module.args = process.argv;
			module.exports = definition(Global, Module);
		}

		else if (typeof namespace === 'string') {
			Global[namespace] = definition(Global, 'MODULE_BROWSER');
		}

	}

	function buildDependencies(config, dependency, exportTo, ret) {

		if (!Utils.isMap(dependency)) return ret();

		var result = [],
			processed = {},
			exportFrom = dependency.id;

		function buildDependencies(dependencies, ret) {
			Utils.mapAsync(dependencies, function(dependency, ret) {

				var exportAs = dependency.id;

				if (!processed.hasOwnProperty(exportAs)) {
					processed[exportAs] = true;
				} else return ret(exportAs);

				var dependencyType = dependency.type;

				if (dependencyType === T_RESOURCE) {

					var pluginURI = dependency.data;
					var resource = ParserCache.get(dependency.uri);
					var def = resource[1], deps = resource[0];

					if (pluginURI) {

						throw 'x';

						// return DependencyEvaluator(config, dependency, function(dependency) {

						// 	var dependency = dependency[0];
						// 	for (var c = 0; c < dependency.length; c++) {

						// 		if (!processed.hasOwnProperty(
						// 			dependency[c].exportAs
						// 		)) {
						// 			if (dependency[c].main) {
						// 				dependency[c].main = isMain;
						// 				dependency[c].exportAs = exportAs;
						// 			}
						// 			result.push(dependency[c]);
						// 		}

						// 	}

						// 	ret(exportAs);

						// }, krang, true);

					} else {

						return buildDependencies(deps, function(deps) {

							result.push(

								buildOutput(
									'value',
									exportAs,
									serialize(def, deps)
								)

							);

							ret(exportAs);
						});

					}

				}

				else if (dependencyType === T_GLOBAL) {

					result.push(

						buildOutput(
							'global',
							exportAs
						)

					);

				}

				else if (dependencyType === T_MODULE) {
					result.push(

						buildOutput(
							'module',
							exportAs
						)

					);
				}



				ret(exportAs);

			}, ret);
		}

		buildDependencies([dependency], function() {
			ret('(' + BuildTemplate + ')(' + [
				new Function([GLOBAL_VAR, MODULE_VAR], result.concat(
					'return ' + exportFrom
				).join('\n')),
				JSON.stringify(String(exportTo))
			].join(',') + ')');
		});
	}





	function Evaluator(config, dependencies, ret, ContextFactory) {
		Utils.mapAsync(dependencies, function(dependency, ret) {

			if (!Utils.isMap(dependency)) return ret();

			var type = dependency.type,
				baseURI = dependency.base;

			if (type === T_RESOURCE) {

				var resourceURI = dependency.uri,
					pluginURI = dependency.data;

				EvaluatorCache.load(null, resourceURI, function(resourceData) {

					if (pluginURI && Utils.hasOwnProperty(resourceData, 'krang')) {

						if (Utils.isFunction(resourceData.krang)) try {
							resourceData.krang(baseURI, pluginURI, ret, ContextFactory);
						}

						catch (exception) {
							StackTrace.ScriptException(baseURI, resourceURI, exception);
							ret();
						}

						else ret(resourceData.krang);

					} else ret(resourceData);

				}, function(baseURI, resourceURI, ret) {

					if (config.debug) Platform.message('evaluating', resourceURI);
					var resource = ParserCache.get(resourceURI);
					var deps = resource[0], def = resource[1];
					if (!Utils.isFunction(def)) return ret(def);

					Evaluator(config, deps, function(deps) {
						try { ret(def.apply(this, deps)); }
						catch (exception) {
							StackTrace.ScriptException(
								baseURI,
								resourceURI,
								exception
							);
							ret();
						}
					});
				});
			}

			else if (type === T_CONTAINER) {
				Evaluator(config, dependency.data, ret);
			}

			else if (type === T_GLOBAL) {
				ret(Global);
			}

			else if (type === T_MODULE) {
				ret({uri: baseURI});
			}

			else if (type === T_PLATFORM) {
				ret(Platform.getInfo());
			}

			else if (type === T_CONFIG) {
				ret(config.config);
			}

			else if (type === 9999) {
				buildDependencies(
					config,
					dependency.data,
					dependency.exportAs,
					ret
				);
			}

			else ret();

		}, ret);
	}

	return Evaluator;

})($krang_hio56q2w3j4b4r,$krang_hio56q2zjmwegi,$krang_hio56q2xe0g6by,$krang_hio56q31b6o2cl,$krang_hio56q3b2y7bp1,$krang_hio56q30jptjiu,$krang_hio56q39hbf5qj);
var $krang_hio56q3e6o2jo7 = (function (Utils, Constants, StackTrace, Parser, Evaluator, Platform) {

	function mergeConfigs(oldConfig, newConfig) {
		var baseURI = oldConfig.baseURI;
		var newConfig = Utils.object.clone(newConfig);

		if (Utils.hasOwnProperty(newConfig, 'baseURI')) {
			if (Utils.isString(newConfig.baseURI)) {
				baseURI = newConfig.baseURI =
				Utils.uri.resolve(newConfig.baseURI, baseURI);
			} else delete newConfig.baseURI;
		}

		if (Utils.hasOwnProperty(newConfig, 'cache') &&
			!Utils.isBoolean(newConfig.cache)) {
			newConfig.cache = String(newConfig.cache);
		}

		return Utils.object.merge(oldConfig, newConfig);
	}

	function parseArguments(args) {
		var dependencies = [], callback = null,
			args = Array.prototype.slice.call(args);
		if (args.length && !Utils.isFunction(args[0])) {
			dependencies = args.shift();
			if (!Utils.isArray(dependencies)) {
				dependencies = [dependencies];
			}
		}
		if (Utils.isFunction(args[0])) {
			callback = args.shift();
		}
		return [dependencies, callback];
	}

	function Context(config) {

		if (config.debug) {
			Platform.message(
				'create context',
				JSON.stringify(config)
			);
		}

		function ContextFactory(newConfig) {
			return Context(mergeConfigs(config, newConfig));
		}

		ContextFactory.message = function() {
			// Platform.message.apply(Platform, arguments);
		};

		ContextFactory.require = function() {

			var baseURI = config.baseURI,
				args = parseArguments(arguments),
				deps = args[0], callback = args[1];

			Parser(config, deps, function(deps) {
				Evaluator(config, deps, function(deps) {
					if (callback) try {
						callback.apply(this, deps);
					} catch (exception) {
						StackTrace.ScriptException(
							baseURI, null, exception
						);
					}
					StackTrace.dump();
				}, ContextFactory);
			});
		};

		return ContextFactory;
	}

	return Context;

})($krang_hio56q2zjmwegi,$krang_hio56q2xe0g6by,$krang_hio56q31b6o2cl,$krang_hio56q3cibdmg,$krang_hio56q3d69lkx5,$krang_hio56q39hbf5qj);
var $krang_hio56q3fc6t7d4 = (function (
	Global, Constants, IDPool, Utils,
	StackTrace, Context, Platform
) {

	var baseURI = Platform.getBaseURI(),
		KRANG_ROOT = IDPool(Constants.KRANG_ROOT),
		KRANG_MEMBER = IDPool(Constants.KRANG_MEMBER),
		KRANG_PROCESS = IDPool(Constants.KRANG_PROCESS),
		config = {xhr: true, cache: true, debug: false, baseURI: baseURI};

	arguments.callee[KRANG_ROOT] = true;
	arguments.callee[KRANG_MEMBER] = true;

	Global.define = function() {
		arguments.callee[KRANG_MEMBER] = true;
		var currentScript = Platform.getCurrentScript();
		if (!currentScript) return;
		currentScript = currentScript[KRANG_PROCESS];
		currentScript.define = true;
		currentScript.done(Array.prototype.slice.call(arguments));
	};

	Global.define.getCurrentScript = function() {
		arguments.callee[KRANG_MEMBER] = true;
		return Platform.getCurrentScript();
	};

	Global.define.version = Constants.VERSION;

	return Platform.boot(Context(config));

})($krang_hio56q2w3j4b4r,$krang_hio56q2xe0g6by,$krang_hio56q30jptjiu,$krang_hio56q2zjmwegi,$krang_hio56q31b6o2cl,$krang_hio56q3e6o2jo7,$krang_hio56q39hbf5qj);
return $krang_hio56q3fc6t7d4
},"krang")