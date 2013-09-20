define(['../Constants'], function(AST) {

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



	function Stack() {
		this.frames = [{}];
	}

	Stack.prototype.put = function(key, value) {
		this.frames[this.frames.length - 1][key] = value;
	};

	Stack.prototype.get = function(key) {

		var frames = this.frames;
		var index = frames.length;

		while (index--) {
			if (frames[index].hasOwnProperty(key)) {
				return frames[index][key];
			}
		}
	};

	Stack.prototype.getAsync = function(key, ret) {

		var frames = this.frames;
		var index = frames.length;

		while (index--) {
			if (frames[index].hasOwnProperty(key)) {
				return ret(
					true,
					frames[index][key],
					frames[index],
					key
				);
			}
		}
		ret(false);
	};

	Stack.prototype.save = function() {
		this.frames.push({});
	};

	Stack.prototype.restore = function() {
		this.frames.pop();
	};



	function FunctionObj(argNames, body, stack) {
		this.argNames = argNames;
		this.body = body;
		this.stack = stack;
	}

	FunctionObj.prototype.exec = function(argValues, ret) {
		var stack = this.stack;
		stack.save();
		for (var c = 0; c < this.argNames.length; c++)
			stack.put(this.argNames[c], argValues[c]);
		processNode(this.body, stack, function(result) {
			stack.restore();
			ret(result);
		});
	};


	function processSelector(node, stack, ret) {

		var fragment = node[1];
		var selector = node.slice(2);

		var evalSelector = function(target, pValue, pKey) {

			forEachAsync(selector, function(fragment, next) {

				pKey = fragment;
				pValue = target;

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

			}, function() {

				ret(target, pValue, pKey);

			});
		};

		if (typeof fragment === 'string') {
			stack.getAsync(fragment, function(found, value, pValue, pKey) {
				if (!found) return ret();
				evalSelector(value, pValue, pKey);
			});
		}

		else processNode(fragment, stack, evalSelector);

	}

	function processCall(node, stack, ret) {
		processNode(node[1], stack, function(target, pValue) {
			var callArgs = [];
			forEachAsync(node.slice(2), function(arg, next) {
				processNode(arg, stack, function(arg) {
					callArgs.push(arg);
					next();
				});
			}, function() {
				if (typeof target === 'function')
					ret(target.apply(pValue, callArgs));
				else if (target instanceof FunctionObj)
					target.exec(callArgs, ret);
			});
		});
	}

	function processVar(node, stack, ret) {
		forEachAsync(node.slice(1), function(definition, next) {
			processNode(definition[1], stack, function(value) {
				stack.put(definition[0], value);
				next();
			});
		}, ret);
	}

	function processFunction(node, stack, ret) {

		var argNames = node[2],
			body = node[3];

		ret(function() {
			stack.save();
			for (var c = 0; c < argNames.length; c++)
				stack.put(argNames[c], arguments[c]);
			processNode(body, stack, function(result) {
				stack.restore();
				ret(result);
			});
		});

		// ret(func);//new FunctionObj(node[2], node[3], stack));
	}




	function processArray(node, stack, ret) {
		var result = [];
		forEachAsync(node.slice(1), function(value, next) {
			processNode(value, stack, function(value) {
				result.push(value);
				next();
			});
		}, function() { ret(result); });
	}

	function processObject(node, stack, ret) {
		var result = {};
		forEachAsync(node.slice(1), function(keyValue, next) {
			processNode(keyValue[1], stack, function(value) {
				result[keyValue[0]] = value;
				next();
			});
		}, function() { ret(result); });
	}

	function processIf(node, stack, ret) {
		processNode(node[1], stack, function(condition) {
			if (Boolean(condition))
				processNode(node[2], stack, ret);
			else if (node[3])
				processNode(node[3], stack, ret);
			else ret();
		});
	}

	function processDo(node, stack, ret) {
		var statement = node[1], condition = node[2];
		whileAsync(function(next) {
			processNode(statement, stack, function() {
				processNode(condition, stack, function(condition) {
					next(Boolean(condition));
				});
			});
		}, ret);
	}

	function processWhile(node, stack, ret) {
		var condition = node[1], statement = node[2];
		whileAsync(function(next) {
			processNode(condition, stack, function(condition) {
				if (!Boolean(condition)) next(false);
				else processNode(statement, stack, next);
			});
		}, ret);
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




	function processNode(node, stack, ret) {

		switch (node[0]) {

			case AST.NULL: return ret(null);
			case AST.TRUE: return ret(true);
			case AST.FALSE: return ret(false);
			case AST.NUMBER: return ret(node[1]);
			case AST.STRING: return ret(node[1]);
			case AST.ARRAY: return processArray(node, stack, ret);
			case AST.OBJECT: return processObject(node, stack, ret);
			case AST.PARENS: return processNode(node[1], stack, ret);

			case AST.IF: return processIf(node, stack, ret);
			case AST.DO_LOOP: return processDo(node, stack, ret);
			case AST.WHILE_LOOP: return processWhile(node, stack, ret);
			case AST.FOR_LOOP: return processForLoop(node, stack, ret);





			case AST.VAR: return processVar(node, stack, ret);
			case AST.FUNCTION: return processFunction(node, stack, ret);
			case AST.CALL: return processCall(node, stack, ret);
			case AST.SELECTOR: return processSelector(node, stack, ret);

			case AST.TYPEOF: return processNode(node[1], stack, function(value) {
				ret(typeof value);
			});


			case AST.ASSIGN: return processSelector(node[1], stack, function(value, parent, key) {
				processNode(node[2], stack, function(value) {
					ret(parent[key] = value);
				});
			});

			case AST.ASSIGN_ADD: return processSelector(node[1], stack, function(value, parent, key) {
				processNode(node[2], stack, function(value) {
					ret(parent[key] += value);
				});
			});

			case AST.ASSIGN_SUB: return processSelector(node[1], stack, function(value, parent, key) {
				processNode(node[2], stack, function(value) {
					ret(parent[key] -= value);
				});
			});

			case AST.INC: return processSelector(node[1], stack, function(value, parent, key) {
				ret(parent[key]++);
			});

			case AST.DEC: return processSelector(node[1], stack, function(value, parent, key) {
				ret(parent[key]--);
			});

			case AST.UINC: return processSelector(node[1], stack, function(value, parent, key) {
				ret(++parent[key]);
			});

			case AST.UDEC: return processSelector(node[1], stack, function(value, parent, key) {
				ret(--parent[key]);
			});


			case AST.EQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left == right);
				});
			});

			case AST.SEQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left === right);
				});
			});

			case AST.NEQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left != right);
				});
			});

			case AST.SNEQ: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left !== right);
				});
			});

			case AST.GE: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left >= right);
				});
			});

			case AST.ADD: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left + right);
				});
			});

			case AST.SUB: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left - right);
				});
			});

			case AST.MUL: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left * right);
				});
			});

			case AST.DIV: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left / right);
				});
			});

			case AST.MOD: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left % right);
				});
			});

			case AST.LT: return processNode(node[1], stack, function(left) {
				processNode(node[2], stack, function(right) {
					ret(left < right);
				});
			});

			case AST.BLOCK: return processNodes(node[1], stack, ret);

			default:
				throw node[0];
		}
	}

	function processNodes(nodes, stack, ret) {
		forEachAsync(nodes, function(node, next) {
			processNode(node, stack, next);
		}, ret);
	}

	function Evaluator(nodes, ret) {

		var stack = new Stack();

		stack.put('JSON', JSON);
		stack.put('document', document);
		stack.put('window', window);
		stack.put('alert', function() {
			console.info.apply(console, arguments);
		});

		processNodes(nodes, stack, ret);
	}

	return Evaluator;

});