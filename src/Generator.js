define('Constants', function(Constants) {

	function ProcessFunction(node) {
		var result = 'function';
		if (node[1]) result += ' ' + node[1];
		result += '(' + node[2].join(', ') + ')';
		result += ProcessNode(node[3]);
		return result;
	}

	function ProcessCall(node) {
		var result = ProcessNode(node[1]) + '(';
		for (var c = 0; c < node[2].length; c++) {
			if (c) result += ', ';
			result += ProcessNode(node[2][c]);
		}
		return result + ')';
	}

	function ProcessSelector(node) {
		var result = '';
		for (var c = 0; c < node[1].length; c++) {
			var fragment = node[1][c];
			if (fragment[0] === 'ID') {
				if (c) result += '.';
				result += fragment[1];
			}
			else if (fragment[0] === 'STRING') {
				if (c) result += '[';
				result += JSON.stringify(fragment[1]);
				if (c) result += ']';
			}
			else {
				if (c) result += '[';
				result += ProcessNode(fragment);
				if (c) result += ']';
			}
		}
		return result;
	}

	function processMap(node) {
		var result = '{';
		for (var c = 1; c < node.length; c++) {
			if (c > 1) result += ', ';
			result += JSON.stringify(node[c][0]);
			result += ': ';
			result += ProcessNode(node[c][1]);
		}
		return result + '}';
	}

	function processArray(node) {
		var result = '[';
		for (var c = 1; c < node.length; c++) {
			if (c > 1) result += ', ';
			result += ProcessNode(node[c]);
		}
		return result + ']';
	}

	function ProcessIf(node) {
		var result = 'if (';
		result += ProcessNode(node[1]);
		result += ') ';
		result += ProcessNode(node[2]);
		if (node[3]) {
			result += ' else ';
			result += ProcessNode(node[3]);
		}
		return result;
	}

	function parseMultiple(node) {
		var result = '';
		for (var c = 1; c < node.length; c++) {
			if (c > 1) result += ', ';
			result += ProcessNode(node[c]);
		}
		return result;
	}

	function processVar(node) {
		var result = 'var ';
		for (var c = 1; c < node.length; c++) {
			if (c > 1) result += ', ';
			result += node[c][0];
			if (node[c][1]) {
				result += ' = ';
				result += ProcessNode(node[c][1]);
			}
		}
		// result += ';';
		return result;
	}

	function processDo(node) {
		var result = 'do ';
		result += ProcessNode(node[1]);
		result += ' while (';
		result += ProcessNode(node[2]);
		result += ')';
		return result;
	}

	function processWhile(node) {
		var result = 'while (';
		result += ProcessNode(node[1]);
		result += ') ';
		result += ProcessNode(node[2]);
		return result;
	}

	function processRegExp(node) {
		var result = 'new RegExp(';
		result += JSON.stringify(node[1]);
		if (node[2]) {
			result += ', ';
			result += JSON.stringify(node[2]);
		}
		result += ')';
		return result;
	}

	function processSwitch(node) {
		var result = 'switch (';
		result += ProcessNode(node[1]);
		result += ') {\n';
		for (var c = 0; c < node[2].length; c++) {
			result += 'case ';
			result += ProcessNode(node[2][c][0]) + ':\n';
			result += ProcessNodes(node[2][c][1]);
			result += '\n';
		}

		if (node[3]) {
			result += 'default:\n';
			result += ProcessNodes(node[3]);
			result += '\n';
		}

		result += '}';
		return result;
	}

	function processForInLoop(node) {
		var result = 'for (';
		result += ProcessNode(node[1]);
		result += ' in ';
		result += ProcessNode(node[2]);
		result += ')\n';
		result += ProcessNode(node[3]);
		return result;
	}

	function processForLoop(node) {
		var result = 'for (';
		result += ProcessNode(node[1]);
		result += ';';
		result += ProcessNode(node[2]);
		result += ';';
		result += ProcessNode(node[3]);
		result += ')\n';
		result += ProcessNode(node[4]);
		return result;
	}

	function ProcessNode(node) {

		switch (node[0]) {

			case Constants.NULL: return 'null';
			case Constants.THIS: return 'this';
			case Constants.TRUE: return 'true';
			case Constants.FALSE: return 'false';
			case Constants.SWITCH: return processSwitch(node);
			case Constants.THROW: return 'throw ' + ProcessNode(node[1]);
			case Constants.BREAK: return 'break ' + (node[1] ? node[1] : '');
			case Constants.CONTINUE: return 'continue ' + (node[1] ? node[1] : '');
			case Constants.PARENS: return '(' + ProcessNode(node[1]) + ')';

			case Constants.STRING: return JSON.stringify(node[1]);
			case Constants.ARRAY: return processArray(node);
			case Constants.OBJECT: return processMap(node);
			case Constants.TERNARY: return ProcessNode(node[1]) + ' ? ' + ProcessNode(node[2]) + ' : ' + ProcessNode(node[3]);
			case Constants.NUMBER: return parseFloat(node[1]);

			case Constants.REGEXP: return processRegExp(node);
			case Constants.WHILE_LOOP: return processWhile(node);
			case Constants.VAR: return processVar(node);
			case Constants.DO_LOOP: return processDo(node);
			case Constants.NEW: return 'new ' + ProcessNode(node[1]);
			case Constants.INC: return ProcessNode(node[1]) + '++';
			case Constants.DEC: return ProcessNode(node[1]) + '--';
			case Constants.DELETE: return 'delete ' + ProcessNode(node[1]);
			case Constants.VOID: return 'void ' + ProcessNode(node[1]);
			case Constants.TYPEOF: return 'typeof ' + ProcessNode(node[1]);
			case Constants.UINC: return '++' + ProcessNode(node[1]);
			case Constants.UDEC: return '--' + ProcessNode(node[1]);
			case Constants.UADD: return '+' + ProcessNode(node[1]);
			case Constants.USUB: return '-' + ProcessNode(node[1]);
			case Constants.BIT_NOT: return '~' + ProcessNode(node[1]);
			case Constants.NOT: return '!' + ProcessNode(node[1]);
			case Constants.MUL: return ProcessNode(node[1]) + ' * ' + ProcessNode(node[2]);
			case Constants.DIV: return ProcessNode(node[1]) + ' / ' + ProcessNode(node[2]);
			case Constants.MOD: return ProcessNode(node[1]) + ' % ' + ProcessNode(node[2]);
			case Constants.ADD: return ProcessNode(node[1]) + ' + ' + ProcessNode(node[2]);
			case Constants.SUB: return ProcessNode(node[1]) + ' - ' + ProcessNode(node[2]);
			case Constants.BIT_SHL: return ProcessNode(node[1]) + ' << ' + ProcessNode(node[2]);
			case Constants.BIT_SHR: return ProcessNode(node[1]) + ' >> ' + ProcessNode(node[2]);
			case Constants.BIT_SHRZ: return ProcessNode(node[1]) + ' >>> ' + ProcessNode(node[2]);
			case Constants.INSTANCEOF: return ProcessNode(node[1]) + ' instanceof ' + ProcessNode(node[2]);
			case Constants.IN: return ProcessNode(node[1]) + ' in ' + ProcessNode(node[2]);
			case Constants.LESS_THAN: return ProcessNode(node[1]) + ' < ' + ProcessNode(node[2]);
			case Constants.GREATER_THAN: return ProcessNode(node[1]) + ' > ' + ProcessNode(node[2]);
			case Constants.LESS_OR_EQUAL: return ProcessNode(node[1]) + ' <= ' + ProcessNode(node[2]);
			case Constants.GREATER_OR_EQUAL: return ProcessNode(node[1]) + ' >= ' + ProcessNode(node[2]);
			case Constants.EQUAL: return ProcessNode(node[1]) + ' == ' + ProcessNode(node[2]);
			case Constants.STRICT_EQUAL: return ProcessNode(node[1]) + ' === ' + ProcessNode(node[2]);
			case Constants.NOT_EQUAL: return ProcessNode(node[1]) + ' != ' + ProcessNode(node[2]);
			case Constants.STRICT_NOT_EQUAL: return ProcessNode(node[1]) + ' !== ' + ProcessNode(node[2]);
			case Constants.BIT_AND: return ProcessNode(node[1]) + ' & ' + ProcessNode(node[2]);
			case Constants.BIT_XOR: return ProcessNode(node[1]) + ' ^ ' + ProcessNode(node[2]);
			case Constants.BIT_OR: return ProcessNode(node[1]) + ' | ' + ProcessNode(node[2]);
			case Constants.AND: return ProcessNode(node[1]) + ' && ' + ProcessNode(node[2]);
			case Constants.OR: return ProcessNode(node[1]) + ' || ' + ProcessNode(node[2]);

			case Constants.ASSIGN: return ProcessNode(node[1]) + ' = ' + ProcessNode(node[2]);
			case Constants.ASSIGN_MUL: return ProcessNode(node[1]) + ' *= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_DIV: return ProcessNode(node[1]) + ' /= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_MOD: return ProcessNode(node[1]) + ' %= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_ADD: return ProcessNode(node[1]) + ' += ' + ProcessNode(node[2]);
			case Constants.ASSIGN_SUB: return ProcessNode(node[1]) + ' -= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_BIT_SHL: return ProcessNode(node[1]) + ' <<= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_BIT_SHR: return ProcessNode(node[1]) + ' >>= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_BIT_SHRZ: return ProcessNode(node[1]) + ' >>>= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_BIT_AND: return ProcessNode(node[1]) + ' &= ' + ProcessNode(node[2]);

			case Constants.ASSIGN_BIT_XOR: return ProcessNode(node[1]) + ' ^= ' + ProcessNode(node[2]);
			case Constants.ASSIGN_BIT_OR: return ProcessNode(node[1]) + ' |= ' + ProcessNode(node[2]);

			case Constants.FUNCTION: return ProcessFunction(node);
			case Constants.BLOCK: return '{' + ProcessNodes(node[1]) + '}';
			case Constants.CALL: return ProcessCall(node);
			case Constants.IF: return ProcessIf(node);
			case Constants.MULTIPLE: return parseMultiple(node);
			case Constants.SELECTOR: return ProcessSelector(node);
			case Constants.RETURN: return 'return ' + (node[1] ? ProcessNode(node[1]) : '');
			case Constants.NAME: return node[1];
			case Constants.FOR_IN_LOOP: return processForInLoop(node);
			case Constants.FOR_LOOP: return processForLoop(node);


			case '#require': return (
				'krang.getModule(' +
					JSON.stringify(node[1]) +
				')'
			);

			default:
				console.error(node[0]);
		}
	}

	function ProcessNodes(nodes) {
		var result = '';
		for (var c = 0; c < nodes.length; c++) {
			var node = nodes[c];
			result += ProcessNode(node) + ';\n';
		}
		return result;
	}

	return ProcessNodes;

});