define('Constants', function(AST) {

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

	FunctionObj.prototype.exec = function(argValues) {
		this.stack.save();
		for (var c = 0; c < this.argNames.length; c++)
			this.stack.put(this.argNames[c], argValues[c]);
		var result = processNode(this.body, this.stack);
		this.stack.restore();
		return result;
	};


	function processSelector(node, stack) {

		var fragment = node[1];
		var selector = node.slice(2);

		var evalSelector = function(target) {
			for (var c = 0; c < selector.length; c++) {
				var fragment = selector[c];
				if (typeof fragment !== 'string')
					fragment = String(processNode(fragment));
				if (!target[fragment]) return;
				target = target[fragment];
			}
			return target;
		};

		if (typeof fragment === 'string')
			return evalSelector(stack.get(fragment));
		else return evalSelector(processNode(fragment, stack));
	}

	function processCall(node, stack) {
		var callArgs = [],
			target = processNode(node[1], stack);
		for (var c = 2; c < node.length; c++)
			callArgs.push(processNode(node[c], stack)/*.toPrimitive()*/);

		if (typeof target === 'function')
			target.apply(this, callArgs);
		else if (target instanceof FunctionObj)
			target.exec(callArgs);
	}

	function processVar(node, stack) {
		for (var c = 1; c < node.length; c++) {
			var key = node[c][0];
			var value = processNode(node[c][1], stack);
			stack.put(key, value);
		}
	}

	function processFunction(node, stack) {
		return new FunctionObj(node[2], node[3], stack);
	}

	function processArray(node, stack) {
		var result = [];
		for (var c = 1; c < node.length; c++)
			result.push(processNode(node[c], stack));
		return result;
	}

	function processObject(node, stack) {
		var result = {};
		for (var c = 1; c < node.length; c++) {
			var key = node[c][0], value = node[c][1];
			result[key] = processNode(value, stack);
		}
		return result;
	}

	function processIf(node, stack) {
		if (Boolean(processNode(node[1], stack))) {
			processNode(node[2], stack);
		} else if (node[3]) {
			processNode(node[3], stack);
		}
	}




	/*
	function BooleanObj(value) {
		this.value = value;
	}

	BooleanObj.prototype.toPrimitive = function() {
		return this.value;
	};

	BooleanObj.prototype.toBoolean = function() {
		return this.value;
	};





	function NumberObj(value) {
		this.value = value;
	}

	NumberObj.prototype.toPrimitive = function() {
		return this.value;
	};

	NumberObj.prototype.toBoolean = function() {
		return (this.value !== 0);
	};



	function StringObj(value) {
		this.value = value;
	}

	StringObj.prototype.toPrimitive = function() {
		return this.value;
	};
	*/




	function processNode(node, stack) {
		switch (node[0]) {

			case AST.NULL: return null;
			case AST.TRUE: return true;
			case AST.FALSE: return false;

			//new NumberObj
			case AST.NUMBER: return (node[1]);
			//new StringObj
			case AST.STRING: return (node[1]);

			case AST.ARRAY: return processArray(node, stack);
			case AST.OBJECT: return processObject(node, stack);
			case AST.IF: return processIf(node, stack);

			case AST.VAR: return processVar(node, stack);
			case AST.FUNCTION: return processFunction(node, stack);
			case AST.CALL: return processCall(node, stack);
			case AST.SELECTOR: return processSelector(node, stack);


			case AST.ASSIGN:
				var ref = processNode(node[1], stack);
				ref.value = processNode(node[2], stack).value;
				return ref;

			case AST.ASSIGN_ADD:
				var ref = processNode(node[1], stack);
				ref.value += processNode(node[2], stack).value;
				return ref;

			case AST.ASSIGN_SUB:
				var ref = processNode(node[1], stack);
				ref.value -= processNode(node[2], stack).value;
				return ref;

			case AST.INC:
				var ref = processNode(node[1], stack);
				ref.value++;
				return ref;

			case AST.DEC:
				var ref = processNode(node[1], stack);
				ref.value--;
				return ref;


			case AST.WHILE_LOOP:
				while (!!processNode(node[1], stack)/*.toBoolean()*/)
					processNode(node[2], stack);
				return;



			//new BooleanObj
			case AST.EQ: return (
				processNode(node[1], stack) ==
				processNode(node[2], stack)
			);

			//new BooleanObj
			case AST.SEQ: return (
				processNode(node[1], stack) ===
				processNode(node[2], stack)
			);

			//new BooleanObj
			case AST.NEQ: return (
				processNode(node[1], stack) !=
				processNode(node[2], stack)
			);

			//new BooleanObj
			case AST.SNEQ: return (
				processNode(node[1], stack) !==
				processNode(node[2], stack)
			);

			//new BooleanObj
			case AST.GE: return (
				processNode(node[1], stack)/*.toPrimitive()*/ >=
				processNode(node[2], stack)/*.toPrimitive()*/
			);

			//new NumberObj
			case AST.ADD: return (
				processNode(node[1], stack)/*.toPrimitive()*/ +
				processNode(node[2], stack)/*.toPrimitive()*/
			);

			//new NumberObj
			case AST.SUB: return (
				processNode(node[1], stack) -
				processNode(node[2], stack)
			);

			//new NumberObj
			case AST.MUL: return (
				processNode(node[1], stack) *
				processNode(node[2], stack)
			);

			//new NumberObj
			case AST.DIV: return (
				processNode(node[1], stack) /
				processNode(node[2], stack)
			);

			//new NumberObj
			case AST.MOD: return (
				processNode(node[1], stack) %
				processNode(node[2], stack)
			);

			case AST.BLOCK: return processNodes(node[1], stack);

			default:
				throw node[0];
		}
	}

	function processNodes(nodes, stack) {
		for (var c = 0; c < nodes.length; c++)
			processNode(nodes[c], stack);
	}

	function Evaluator(nodes) {

		var stack = new Stack();

		stack.put('document', document);
		stack.put('window', window);
		stack.put('require', function() {
			console.info('calling', arguments);
		});
		stack.put('alert', function() {
			console.info.apply(console, arguments);
		});

		processNodes(nodes, stack);
	}

	return Evaluator;

});