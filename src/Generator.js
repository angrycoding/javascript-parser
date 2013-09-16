define('Constants', function(Constants) {

	var level = 0;

	function makeTabs(times) {
		var result = '';
		for (var c = 1; c <= times; c++)
			result += '\t';
		return result;
	}

	function adjust(string) {
		var result = [];
		string = string.split(/[\r\n]/);
		for (var c = 0; c < string.length; c++) {
			result.push(makeTabs(level) + string[c]);
		}
		return result.join('\n');
	}

	function ProcessFunction(node) {
		var result = 'function';
		if (node[1]) result += ' ' + node[1];
		result += '(' + node[2].join(', ') + ') ';
		result += processNode(node[3]);
		return adjust(result);
	}

	function ProcessCall(node) {
		var result = processNode(node[1]) + '(';
		for (var c = 0; c < node[2].length; c++) {
			if (c) result += ', ';
			result += processNode(node[2][c]);
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
				result += processNode(fragment);
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
			result += processNode(node[c][1]);
		}
		return result + '}';
	}

	function processArray(node) {
		var result = '[';
		for (var c = 1; c < node.length; c++) {
			if (c > 1) result += ', ';
			result += processNode(node[c]);
		}
		return result + ']';
	}

	function ProcessIf(node) {
		var result = 'if (';
		result += processNode(node[1]);
		result += ') ';
		result += processNode(node[2]);
		if (node[3]) {
			result += ' else ';
			result += processNode(node[3]);
		}
		return result;
	}

	function parseMultiple(node) {
		var result = '';
		for (var c = 1; c < node.length; c++) {
			if (c > 1) result += ', ';
			result += processNode(node[c]);
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
				result += processNode(node[c][1]);
			}
		}
		return adjust(result, level);
	}

	function processDo(node) {
		var result = 'do ';
		result += processNode(node[1]);
		result += ' while (';
		result += processNode(node[2]);
		result += ')';
		return result;
	}

	function processWhile(node) {
		var result = 'while (';
		result += processNode(node[1]);
		result += ') ';
		result += processNode(node[2]);
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
		result += processNode(node[1]);
		result += ') {\n';
		for (var c = 0; c < node[2].length; c++) {
			result += 'case ';
			result += processNode(node[2][c][0]) + ':\n';
			result += processNodes(node[2][c][1]);
			result += '\n';
		}

		if (node[3]) {
			result += 'default:\n';
			result += processNodes(node[3]);
			result += '\n';
		}

		result += '}';
		return result;
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

	function processNode(node) {

		switch (node[0]) {

			case Constants.NULL: return 'null';
			case Constants.TRUE: return 'true';
			case Constants.FALSE: return 'false';
			case Constants.NUMBER: return String(node[1]);
			case Constants.STRING: return JSON.stringify(node[1]);
			case Constants.LABELLED: return node[1] + ': ' + processNode(node[2]);

			case Constants.THIS: return 'this';
			case Constants.SWITCH: return processSwitch(node);
			case Constants.THROW: return 'throw ' + processNode(node[1]);
			case Constants.BREAK: return 'break ' + (node[1] ? node[1] : '');
			case Constants.CONTINUE: return 'continue ' + (node[1] ? node[1] : '');
			case Constants.PARENS: return '(' + processNode(node[1]) + ')';

			case Constants.ARRAY: return processArray(node);
			case Constants.OBJECT: return processMap(node);
			case Constants.TERNARY: return processNode(node[1]) + ' ? ' + processNode(node[2]) + ' : ' + processNode(node[3]);

			case Constants.REGEXP: return processRegExp(node);
			case Constants.WHILE_LOOP: return processWhile(node);
			case Constants.VAR: return processVar(node);
			case Constants.DO_LOOP: return processDo(node);
			case Constants.NEW: return 'new ' + processNode(node[1]);
			case Constants.INC: return processNode(node[1]) + '++';
			case Constants.DEC: return processNode(node[1]) + '--';
			case Constants.DELETE: return 'delete ' + processNode(node[1]);
			case Constants.VOID: return 'void ' + processNode(node[1]);
			case Constants.TYPEOF: return 'typeof ' + processNode(node[1]);
			case Constants.UINC: return '++' + processNode(node[1]);
			case Constants.UDEC: return '--' + processNode(node[1]);
			case Constants.UADD: return '+' + processNode(node[1]);
			case Constants.USUB: return '-' + processNode(node[1]);
			case Constants.BNOT: return '~' + processNode(node[1]);
			case Constants.NOT: return '!' + processNode(node[1]);
			case Constants.MUL: return processNode(node[1]) + ' * ' + processNode(node[2]);
			case Constants.DIV: return processNode(node[1]) + ' / ' + processNode(node[2]);
			case Constants.MOD: return processNode(node[1]) + ' % ' + processNode(node[2]);
			case Constants.ADD: return processNode(node[1]) + ' + ' + processNode(node[2]);
			case Constants.SUB: return processNode(node[1]) + ' - ' + processNode(node[2]);
			case Constants.BSHL: return processNode(node[1]) + ' << ' + processNode(node[2]);
			case Constants.BSHR: return processNode(node[1]) + ' >> ' + processNode(node[2]);
			case Constants.BSHRZ: return processNode(node[1]) + ' >>> ' + processNode(node[2]);
			case Constants.INSTANCEOF: return processNode(node[1]) + ' instanceof ' + processNode(node[2]);
			case Constants.IN: return processNode(node[1]) + ' in ' + processNode(node[2]);
			case Constants.LT: return processNode(node[1]) + ' < ' + processNode(node[2]);
			case Constants.GT: return processNode(node[1]) + ' > ' + processNode(node[2]);
			case Constants.LE: return processNode(node[1]) + ' <= ' + processNode(node[2]);
			case Constants.GE: return processNode(node[1]) + ' >= ' + processNode(node[2]);
			case Constants.EQ: return processNode(node[1]) + ' == ' + processNode(node[2]);
			case Constants.SEQ: return processNode(node[1]) + ' === ' + processNode(node[2]);
			case Constants.NEQ: return processNode(node[1]) + ' != ' + processNode(node[2]);
			case Constants.SNEQ: return processNode(node[1]) + ' !== ' + processNode(node[2]);
			case Constants.BAND: return processNode(node[1]) + ' & ' + processNode(node[2]);
			case Constants.BXOR: return processNode(node[1]) + ' ^ ' + processNode(node[2]);
			case Constants.BOR: return processNode(node[1]) + ' | ' + processNode(node[2]);
			case Constants.AND: return processNode(node[1]) + ' && ' + processNode(node[2]);
			case Constants.OR: return processNode(node[1]) + ' || ' + processNode(node[2]);

			case Constants.ASSIGN: return processNode(node[1]) + ' = ' + processNode(node[2]);
			case Constants.ASSIGN_MUL: return processNode(node[1]) + ' *= ' + processNode(node[2]);
			case Constants.ASSIGN_DIV: return processNode(node[1]) + ' /= ' + processNode(node[2]);
			case Constants.ASSIGN_MOD: return processNode(node[1]) + ' %= ' + processNode(node[2]);
			case Constants.ASSIGN_ADD: return processNode(node[1]) + ' += ' + processNode(node[2]);
			case Constants.ASSIGN_SUB: return processNode(node[1]) + ' -= ' + processNode(node[2]);
			case Constants.ASSIGN_BSHL: return processNode(node[1]) + ' <<= ' + processNode(node[2]);
			case Constants.ASSIGN_BSHR: return processNode(node[1]) + ' >>= ' + processNode(node[2]);
			case Constants.ASSIGN_BSHRZ: return processNode(node[1]) + ' >>>= ' + processNode(node[2]);
			case Constants.ASSIGN_BAND: return processNode(node[1]) + ' &= ' + processNode(node[2]);

			case Constants.ASSIGN_BXOR: return processNode(node[1]) + ' ^= ' + processNode(node[2]);
			case Constants.ASSIGN_BOR: return processNode(node[1]) + ' |= ' + processNode(node[2]);

			case Constants.FUNCTION: return ProcessFunction(node);

			case Constants.BLOCK:
				level++;
				var result = processNodes(node[1]);
				level--;
				return '{\n' + result + '}';

			case Constants.CALL: return ProcessCall(node);
			case Constants.IF: return ProcessIf(node);
			case Constants.MULTIPLE: return parseMultiple(node);
			case Constants.SELECTOR: return ProcessSelector(node);
			case Constants.RETURN: return 'return ' + (node[1] ? processNode(node[1]) : '');
			case Constants.NAME: return node[1];
			case Constants.FOR_IN_LOOP: return processForInLoop(node);
			case Constants.FOR_LOOP: return processForLoop(node);

			default:
				console.error(node[0]);
		}
	}

	function processNodes(nodes) {
		var result = [];
		for (var c = 0; c < nodes.length; c++)
			result.push(processNode(nodes[c]) + ';');
		return result.join('\n');
	}

	return processNodes;

});