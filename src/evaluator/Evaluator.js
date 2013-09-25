define(['../Constants', 'Stack'], function(AST, Stack) {

	function forEachAsync(list, iterator, ret) {
		if (!(list instanceof Object)) return ret();
		var keys, key, length;
		var i = -1, calls = 0, looping = false;
		if (list instanceof Array) {
			length = list.length;
		} else {
			keys = Object.keys(list);
			length = keys.length;
		}
		var resume = function() {
			calls += 1;
			if (looping) return;
			looping = true;
			while (calls > 0) {
				calls -= 1, i += 1;
				if (i === length) return ret();
				key = (keys ? keys[i] : i);
				iterator(list[key], function(stop) {
					if (stop === true) ret();
					else resume();
				}, key);
			}
			looping = false;
		};
		resume();
	}

	function whileAsync(iterator, ret) {
		(function resume() {
			iterator(function(next) {
				if (next === false) ret();
				else resume();
			});
		})();
	}




	function processArray(node, stack, retn) {
		var result = [];
		forEachAsync(node.slice(1), function(value, next) {
			processNode(value, stack, function(value) {
				result.push(value);
				next();
			});
		}, function() { retn(result); });
	}

	function processObject(node, stack, retn) {
		var result = {};
		forEachAsync(node.slice(1), function(keyValue, next) {
			processNode(keyValue[1], stack, function(value) {
				result[keyValue[0]] = value;
				next();
			});
		}, function() { retn(result); });
	}



	function processFunction(node, stack, retn) {

		var argNames = node[2], body = node[3];

		retn(function(callArgs, retn) {
			stack.save();

			for (var c = 0; c < argNames.length; c++)
				stack.put(argNames[c], callArgs[c]);

			processNode(body, stack, function(result) {
				stack.restore();
				retn(result);
			}, function(result) {
				stack.restore();
				retn(result);
			});



		});

	}

	function processVar(node, stack, retn) {
		forEachAsync(node.slice(1), function(definition, next) {
			processNode(definition[1], stack, function(value) {
				stack.put(definition[0], value);
				next();
			});
		}, retn);
	}

	function processCall(node, stack, retn) {
		processNode(node[1], stack, function(target, pValue) {
			var callArgs = [];
			forEachAsync(node.slice(2), function(arg, next) {
				processNode(arg, stack, function(arg) {
					callArgs.push(arg);
					next();
				});
			}, function() {
				if (String(target).indexOf('native') !== -1)
					retn(target.apply(pValue, callArgs));
				else target.call(pValue, callArgs, retn);
			});
		});
	}

	function processSelector(node, stack, retn) {

		var fragment = node[1];
		var selector = node.slice(2);

		var evalSelector = function(target, pValue, pKey) {

			forEachAsync(selector, function(fragment, next) {

				pKey = fragment;
				pValue = target;

				try {
					if (typeof fragment !== 'string') {
						processNode(fragment, stack, function(fragment) {
							pKey = fragment;
							pValue = target;
							if (typeof target[fragment] !== 'undefined') {
								target = target[fragment];
								next();
							} else {
								// pKey = undefined;
								// pValue = undefined;
								target = undefined;
								next(true);
							}
						});
					}

					else if (typeof target[fragment] !== 'undefined') {

						target = target[fragment];

						next();
					}

					else {
						// pKey = undefined;
						// pValue = undefined;
						target = undefined;
						next(true);
					}

				} catch (e) {
					target = undefined;
					next(true);
				}

			}, function() {

				retn(target, pValue, pKey);

			});
		};

		if (typeof fragment === 'string') {
			stack.getAsync(fragment, function(found, value, pValue, pKey) {
				if (!found) return retn();
				evalSelector(value, pValue, pKey);
			});
		}

		else processNode(fragment, stack, evalSelector);

	}




	function processIf(node, stack, retn, retf) {
		processNode(node[1], stack, function(condition) {
			if (Boolean(condition))
				processNode(node[2], stack, retn, retf);
			else if (node[3])
				processNode(node[3], stack, retn, retf);
			else retn();
		});
	}

	function processDo(node, stack, retn, retf) {
		var statement = node[1], condition = node[2];
		whileAsync(function(next) {
			processNode(statement, stack, function() {
				processNode(condition, stack, function(condition) {
					next(Boolean(condition));
				});
			}, retf);
		}, retn);
	}

	function processWhile(node, stack, retn, retf) {
		var condition = node[1], statement = node[2];
		whileAsync(function(next) {
			processNode(condition, stack, function(condition) {
				if (!Boolean(condition)) next(false);
				else processNode(statement, stack, next, retf);
			});
		}, retn);
	}






	function processForLoop(node, stack, ret) {
		var initializer = node[1], condition = node[2],
			iterator = node[3], statement = node[4];
		processNode(initializer, stack, function() {
			whileAsync(function(next) {
				processNode(condition, stack, function(condition) {
					if (!Boolean(condition)) return next(false);
					processNode(statement, stack, function() {
						processNode(iterator, stack, next);
					});
				});
			}, ret);
		});
	}


	function processXMLNode(node, stack, ret) {


		if (node[0] === AST.XML_TEXT)
			ret(document.createTextNode(node[1]));

		else if (node[0] === AST.XML_CDATA)
			ret(document.createTextNode(node[1]))

		else if (node[0] === AST.XML_TAG) {

			var el = document.createElement(node[1]);
			for (var c = 0; c < node[2].length; c++)
				el.setAttribute(node[2][c][0], node[2][c][1]);

			forEachAsync(node[3], function(node, next) {

				processXMLNode(node, stack, function(node) {
					el.appendChild(node);
					next();
				});

			}, function() {
				ret(el);
			});
		}

	}


	function processNode(node, stack, retn, retf) {

		switch (node[0]) {

			case AST.NULL: return retn(null);
			case AST.TRUE: return retn(true);
			case AST.FALSE: return retn(false);
			case AST.NUMBER: return retn(node[1]);
			case AST.STRING: return retn(node[1]);
			case AST.REGEXP: return retn(new RegExp(node[1], node[2]));

			case AST.ARRAY: return processArray(node, stack, retn);
			case AST.OBJECT: return processObject(node, stack, retn);
			case AST.FUNCTION: return processFunction(node, stack, retn);

			case AST.PARENS: return processNode(node[1], stack, retn);
			case AST.VAR: return processVar(node, stack, retn);
			case AST.CALL: return processCall(node, stack, retn);
			case AST.SELECTOR: return processSelector(node, stack, retn);

			case AST.BLOCK: return processNodes(node[1], stack, retn, retf);
			case AST.IF: return processIf(node, stack, retn, retf);
			case AST.DO_LOOP: return processDo(node, stack, retn, retf);
			case AST.WHILE_LOOP: return processWhile(node, stack, retn, retf);
			case AST.FOR_LOOP: return processForLoop(node, stack, retn, retf);
			case AST.RETURN: return processNode(node[1], stack, retf);



			case AST.TYPEOF: return processNode(node[1], stack, function(value) {
				retn(typeof value);
			});


			case AST.ASSIGN: return processSelector(node[1], stack, function(value, parent, key) {
				processNode(node[2], stack, function(value) {
					retn(parent[key] = value);
				});
			});

			case AST.ASSIGN_ADD: return processSelector(node[1], stack, function(value, parent, key) {
				processNode(node[2], stack, function(value) {
					retn(parent[key] += value);
				});
			});

			case AST.ASSIGN_SUB: return processSelector(node[1], stack, function(value, parent, key) {
				processNode(node[2], stack, function(value) {
					retn(parent[key] -= value);
				});
			});

			case AST.INC: return processSelector(node[1], stack, function(value, parent, key) {
				retn(parent[key]++);
			});

			case AST.DEC: return processSelector(node[1], stack, function(value, parent, key) {
				retn(parent[key]--);
			});

			case AST.UINC: return processSelector(node[1], stack, function(value, parent, key) {
				retn(++parent[key]);
			});

			case AST.UDEC: return processSelector(node[1], stack, function(value, parent, key) {
				retn(--parent[key]);
			});


			case AST.EQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left == right);
				});
			});

			case AST.SEQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left === right);
				});
			});

			case AST.NEQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left != right);
				});
			});

			case AST.SNEQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left !== right);
				});
			});

			case AST.GE: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left >= right);
				});
			});

			case AST.GT: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left > right);
				});
			});

			case AST.ADD: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left + right);
				});
			});

			case AST.SUB: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left - right);
				});
			});

			case AST.MUL: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left * right);
				});
			});

			case AST.DIV: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left / right);
				});
			});

			case AST.MOD: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left % right);
				});
			});

			case AST.LT: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left < right);
				});
			});

			case AST.OR: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left || right);
				});
			});

			case AST.AND: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					retn(left && right);
				});
			});

			case AST.XML_TAG:
			case AST.XML_CDATA: return processXMLNode(node, stack, retn);

			default:
				throw node[0];
		}
	}

	function processNodes(nodes, stack, retn, retf) {
		forEachAsync(nodes, function(node, next) {
			processNode(node, stack, next, retf);
		}, retn);
	}

	function Evaluator(nodes, ret) {

		var stack = new Stack();

		stack.put('JSON', JSON);
		stack.put('document', document);
		stack.put('window', window);

		stack.put('alert', function(args, ret) {
			console.info.apply(console, args);
			ret();
		});

		processNodes(nodes, stack, ret, ret);
	}

	return Evaluator;

});