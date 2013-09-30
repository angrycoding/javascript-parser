define(['Constants', 'parser/Parser'], function(AST, CachePool, Parser) {

	function isUndefined(value) {
		return (value === undefined);
	}

	function isFunction(value) {
		return (value instanceof Function);
	}

	function isArray(value) {
		return (value instanceof Array);
	}

	function isObject(value) {
		return (value instanceof Object);
	}

	function isMap(value) {
		return (
			value instanceof Object &&
			!(value instanceof Function) &&
			!(value instanceof Array)
		);
	}

	function toFunction(value) {
		return (isFunction(value) ? value : function(){});
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

	function ProcessFunction(node, ret) {
		var result = 'function';
		if (node[1]) result += ' ' + node[1];
		result += '(' + node[2].join(',') + '){';
		processNodes(node[3], function(body) {
			result += body + '}';
			ret(result);
		});
	}

	function ProcessCall(node, ret) {
		processNode(node[1], function(target) {
			mapAsync(node.slice(2), function(arg, ret) {
				processNode(arg, ret);
			}, function(args) {
				ret(target + '(' + args.join(',') + ')');
			});
		});
	}

	function ProcessSelector(node, ret) {
		var index = 0;
		mapAsync(node.slice(1), function(fragment, ret) {

			if (typeof fragment === 'string') {
				if (index) fragment = '.' + fragment;
				ret(fragment);
			}

			else processNode(fragment, function(fragment) {
				if (index) fragment = '[' + fragment;
				if (index) fragment = fragment + ']';
				ret(fragment);
			});

			index++;

		}, function(selector) { ret(selector.join('')); });
	}

	function processMap(node, ret) {
		mapAsync(node.slice(1), function(node, ret) {
			var key = node[0], value = node[1];
			processNode(value, function(value) {
				ret(JSON.stringify(key) + ':' + value);
			});
		}, function(nodes){ ret('{' + nodes.join(',') + '}'); });
	}

	function processArray(node, ret) {
		mapAsync(node.slice(1), function(node, ret) {
			processNode(node, ret);
		}, function(nodes) { ret('[' + nodes.join(',') + ']'); });
	}

	function ProcessIf(node, ret) {
		var result = 'if(';
		processNode(node[1], function(condition) {
			result += condition + ')';
			processNode(node[2], function(statement) {
				result += statement;
				if (!node[3]) return ret(result);
				processNode(node[3], function(statement) {
					result += ' else ' + statement;
					ret(result);
				});
			});
		});
	}

	function parseMultiple(node, ret) {
		mapAsync(node.slice(1), function(node, ret) {
			processNode(node, ret);
		}, function(nodes) { ret(nodes.join(',')); });
	}

	function processVar(node, ret) {
		mapAsync(node.slice(1), function(node, ret) {
			var name = node[0], value = node[1];
			if (!value) return ret(name);
			processNode(value, function(value) {
				ret(name + '=' + value);
			});
		}, function(nodes) { ret('var ' + nodes.join(',')); });
	}

	function processDo(node, ret) {
		var result = 'do ';
		processNode(node[1], function(statement) {
			result += statement;
			result += ' while(';
			processNode(node[2], function(expression) {
				ret(result += expression + ')');
			});
		});
	}

	function processWhile(node, ret) {
		var result = 'while(';
		processNode(node[1], function(expression) {
			result += expression + ')';
			processNode(node[2], function(statement) {
				ret(result += statement);
			});
		});
	}

	function processRegExp(node, ret) {
		var result = '/' + node[1] + '/';
		if (node[2]) result += node[2];
		ret(result);
	}

	function processSwitch(node) {
		var result = 'switch(';
		result += processNode(node[1]);
		result += '){';
		for (var c = 0; c < node[2].length; c++) {
			result += 'case ';
			result += processNode(node[2][c][0]) + ':';
			result += processNodes(node[2][c][1]);
		}
		if (node[3]) {
			result += 'default:';
			result += processNodes(node[3]);
		}
		result += '}';
		return result;
	}

	function processWith(node, ret) {
		var result = 'with(';
		processNode(node[1], function(expression) {
			result += expression + ')';
			processNode(node[2], function(statement) {
				ret(result += statement);
			});
		});
	}

	function processTry(node, ret) {
		var result = 'try{';
		processNodes(node[1], function(statements) {
			result += statements + '}';
			if (typeof node[2] === 'string') {
				result += 'catch(' + node[2] + '){';
				processNodes(node[3], function(statements) {
					result += statements + '}';
					if (!node[4]) return ret(result);
					result += 'finally{';
					processNodes(node[4], function(statements) {
						ret(result += statements + '}');
					});
				});
			} else {
				result += 'finally{';
				processNodes(node[2], function(statements) {
					ret(result += statements + '}');
				});
			}
		});
	}





	function processForInLoop(node) {
		var result = 'for (';
		result += processNode(node[1]);
		result += ' in ';
		result += processNode(node[2]);
		result += ')\n';
		result += processNode(node[3]);
		return result;
	}

	function processForLoop(node) {
		var result = 'for (';
		result += processNode(node[1]);
		result += ';';
		result += processNode(node[2]);
		result += ';';
		result += processNode(node[3]);
		result += ')\n';
		result += processNode(node[4]);
		return result;
	}

	function processMult() {
		var args = Array.prototype.slice.call(arguments);
		var ret = args.pop();
		mapAsync(args, function(arg, ret) {
			if (typeof arg === 'string') ret(arg);
			else processNodes(arg, ret);
		}, function(args) { ret(args.join('')); });
	}

	function processSingle() {
		var args = Array.prototype.slice.call(arguments);
		var ret = args.pop();
		mapAsync(args, function(arg, ret) {
			if (typeof arg === 'string') ret(arg);
			else processNode(arg, ret);
		}, function(args) { ret(args.join('')); });
	}

	function processXML(node, ret) {

		function processXMLNode(node, ret) {
			if (node[0] === AST.XML_TEXT)
				return ret(node[1]);

			if (node[0] === AST.XML_CDATA)
				return ret('<![CDATA[' + node[1] + ']]>');

			if (node[0] === AST.XML_TAG) {

				var result = '<', name = node[1];
				result += name;
				for (var c = 0; c < node[2].length; c++)
					result += ' ' + node[2][c][0] + '=' + JSON.stringify(node[2][c][1]);

				if (node[3]) {
					result += '>';
					mapAsync(node[3], function(node, ret) {
						processXMLNode(node, ret);
					}, function(nodes) {
						result += nodes.join('');
						ret(result += '</' + name + '>');
					});
				} else ret(result += ' />');
			}
		}

		processXMLNode(node, function(node) {
			ret(JSON.stringify(node));
		});

	}


	function processNode(node, ret) {

		switch (node[0]) {

			case AST.THIS: return ret('this');
			case AST.NULL: return ret('null');
			case AST.TRUE: return ret('true');
			case AST.FALSE: return ret('false');
			case AST.NUMBER: return ret(String(node[1]));
			case AST.STRING: return ret(JSON.stringify(node[1]));
			case AST.REGEXP: return processRegExp(node, ret);
			case AST.ARRAY: return processArray(node, ret);
			case AST.OBJECT: return processMap(node, ret);
			case AST.XML_TAG: return processXML(node, ret);
			case AST.XML_CDATA: return processXML(node, ret);

			case AST.INC: return processSingle(node[1], '++', ret);
			case AST.DEC: return processSingle(node[1], '--', ret);
			case AST.NEW: return processSingle('new ', node[1], ret);
			case AST.THROW: return processSingle('throw ', node[1], ret);
			case AST.DELETE: return processSingle('delete ', node[1], ret);
			case AST.TYPEOF: return processSingle('typeof ', node[1], ret);
			case AST.VOID: return processSingle('void ', node[1], ret);
			case AST.UINC: return processSingle('++', node[1], ret);
			case AST.UDEC: return processSingle('--', node[1], ret);
			case AST.UADD: return processSingle('+', node[1], ret);
			case AST.USUB: return processSingle('-', node[1], ret);
			case AST.BNOT: return processSingle('~', node[1], ret);
			case AST.NOT: return processSingle('!', node[1], ret);
			case AST.MUL: return processSingle(node[1], '*', node[2], ret);
			case AST.DIV: return processSingle(node[1], '/', node[2], ret);
			case AST.MOD: return processSingle(node[1], '%', node[2], ret);
			case AST.ADD: return processSingle(node[1], '+', node[2], ret);
			case AST.SUB: return processSingle(node[1], '-', node[2], ret);
			case AST.BSHL: return processSingle(node[1], '<<', node[2], ret);
			case AST.BSHR: return processSingle(node[1], '>>', node[2], ret);
			case AST.BSHRZ: return processSingle(node[1], '>>>', node[2], ret);
			case AST.LT: return processSingle(node[1], '<', node[2], ret);
			case AST.GT: return processSingle(node[1], '>', node[2], ret);
			case AST.LE: return processSingle(node[1], '<=', node[2], ret);
			case AST.GE: return processSingle(node[1], '>=', node[2], ret);
			case AST.EQ: return processSingle(node[1], '==', node[2], ret);
			case AST.SEQ: return processSingle(node[1], '===', node[2], ret);
			case AST.NEQ: return processSingle(node[1], '!=', node[2], ret);
			case AST.SNEQ: return processSingle(node[1], '!==', node[2], ret);
			case AST.BAND: return processSingle(node[1], '&', node[2], ret);
			case AST.BXOR: return processSingle(node[1], '^', node[2], ret);
			case AST.BOR: return processSingle(node[1], '|', node[2], ret);
			case AST.AND: return processSingle(node[1], '&&', node[2], ret);
			case AST.OR: return processSingle(node[1], '||', node[2], ret);
			case AST.ASSIGN: return processSingle(node[1], '=', node[2], ret);
			case AST.ASSIGN_MUL: return processSingle(node[1], '*=', node[2], ret);
			case AST.ASSIGN_DIV: return processSingle(node[1], '/=', node[2], ret);
			case AST.ASSIGN_MOD: return processSingle(node[1], '%=', node[2], ret);
			case AST.ASSIGN_ADD: return processSingle(node[1], '+=', node[2], ret);
			case AST.ASSIGN_SUB: return processSingle(node[1], '-=', node[2], ret);
			case AST.ASSIGN_BSHL: return processSingle(node[1], '<<=', node[2], ret);
			case AST.ASSIGN_BSHR: return processSingle(node[1], '>>=', node[2], ret);
			case AST.ASSIGN_BSHRZ: return processSingle(node[1], '>>>=', node[2], ret);
			case AST.ASSIGN_BAND: return processSingle(node[1], '&=', node[2], ret);
			case AST.ASSIGN_BXOR: return processSingle(node[1], '^=', node[2], ret);
			case AST.ASSIGN_BOR: return processSingle(node[1], '|=', node[2], ret);
			case AST.IN: return processSingle(node[1], ' in ', node[2], ret);
			case AST.INSTANCEOF: return processSingle(node[1], ' instanceof ', node[2], ret);
			case AST.PARENS: return processSingle('(', node[1], ')', ret);
			case AST.BLOCK: return processMult('{', node[1], '}', ret);
			case AST.TERNARY: return processSingle(node[1], '?', node[2], ':', node[3], ret);
			case AST.MULTIPLE: return parseMultiple(node, ret);

			case AST.RETURN: return processSingle('return ', node[1], ret);
			case AST.BREAK: return processSingle('break ', node[1], ret);
			case AST.CONTINUE: return processSingle('continue ', node[1], ret);


			case AST.LABELLED: return node[1].join(':\n') + ':\n' + processNode(node[2]);


			case AST.IF: return ProcessIf(node, ret);
			case AST.TRY: return processTry(node, ret);
			case AST.VAR: return processVar(node, ret);
			case AST.CALL: return ProcessCall(node, ret);
			case AST.WITH: return processWith(node, ret);
			case AST.DO_LOOP: return processDo(node, ret);
			case AST.WHILE_LOOP: return processWhile(node, ret);
			case AST.SELECTOR: return ProcessSelector(node, ret);
			case AST.FUNCTION: return ProcessFunction(node, ret);

			case AST.SWITCH: return processSwitch(node);
			case AST.FOR_IN_LOOP: return processForInLoop(node);
			case AST.FOR_LOOP: return processForLoop(node);

			case '#REQUIRE':

				var requestURI = node[1];


				// ResourceCache(requestURI, function(result) {

				// 	console.info('lOADED', requestURI);

				// }, function(load) {

				// 	var req = new XMLHttpRequest();
				// 	req.open('GET', requestURI, true);
				// 	req.onreadystatechange = function() {
				// 		if (req.readyState !== 4) return;
				// 		if (req.status === 200) {

				// 			var AST = Parser(req.responseText);
				// 			dump(AST);

				// 			Generator(AST, load);
				// 		}
				// 	};
				// 	req.send(null);


				// });


				mapAsync(node.slice(2), function(node, ret) {
					processNode(node, ret);
				}, function(nodes) {


					ret(
						'console.info("CALL REQUIRE >", ' +
						JSON.stringify(requestURI) + ',' +
						nodes.join(',') +
						')'
					);


				});

				return;

				// for (var c = 2; c < node.length; c++) {
				// 	result += ', ';
				// 	result += processNode(node[c]);
				// }
				// result += ')';
				// return ret(result);

			default:
				console.error(node[0]);
		}
	}

	function processNodes(nodes, ret) {
		mapAsync(nodes, function(node, ret) {
			processNode(node, function(node) {
				ret(node + ';');
			});
		}, function(nodes) { ret(nodes.join('\n')); });
	}

	function Generator(nodes, ret) {
		processNodes(nodes, function(code) {
			// ResourceCache.allLoaded(function() {
				ret(code);
			// });
		});
	}

	return Generator;

});