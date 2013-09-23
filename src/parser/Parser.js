define([
	'../Constants',
	'TokenStream',
	'XMLParser',
	'RegexpParser'
], function(AST, tokenizer, XMLParser, RegexpParser) {

	var Tokenizer = tokenizer.constructor;

	// used to convert control characters into regular characters
	var stringEscape = /\\(x[0-9A-F]{2}|u[0-9A-F]{4}|.)/g;

	var fileName = 'FILENAME';

	var SILENT_FLAG = 1 << 0;
	var NO_IN_FLAG = 1 << 1;

	// replaces control sequences with actual characters
	function escapeStringLiteral(string) {
		var string = string.slice(1, -1);
		return string.replace(stringEscape, function(str, match) {
			switch (match[0] + match.length) {
				// backspace
				case 'b1': return String.fromCharCode(8);
				// form feed
				case 'f1': return String.fromCharCode(12);
				// new line
				case 'n1': return String.fromCharCode(10);
				// carriage return
				case 'r1': return String.fromCharCode(13);
				// horizontal tab
				case 't1': return String.fromCharCode(9);
				// unicode sequence (4 hex digits: dddd)
				case 'u5': return String.fromCharCode(parseInt(match.substr(1), 16));
				// hexadecimal sequence (2 digits: dd)
				case 'x3': return String.fromCharCode(parseInt(match.substr(1), 16));
				// by default return escaped character "as is"
				default: return match;
			}
		});
	}

	function ParseError(expected) {

		if (!(this instanceof arguments.callee) ) {
			var args = Array.prototype.slice.call(arguments);
			if (args.length) throw new ParseError(args);
			throw new ParseError([]);
		}

		var errorMessage;
		var found = tokenizer.getFragment();
		var lineNumber = tokenizer.getLineNumber();

		if (!expected.length) {
			errorMessage = (
				fileName + '(' + lineNumber + ') ' +
				'Syntax error: unexpected token ' + found
			);
		} else {

			expected = expected.join('" or "');

			errorMessage = (
				fileName + '(' + lineNumber +
				') Syntax error: expected "' + expected +
				'" but "' + found + '" found'
			);
		}

		return {
			file: fileName,
			line: lineNumber,
			expected: expected,
			found: found,
			toString: function() {
				return errorMessage;
			}
		};
	}

	function LHSExpression(expression, position) {
		while (expression[0] === AST.PARENS)
			expression = expression[1];
		if (expression[0] !== AST.SELECTOR) {
			if (position === -1) ParseError('Invalid left-hand side expression in prefix operation');
			if (position === 1) ParseError('Invalid left-hand side expression in postfix operation')
			ParseError('Invalid left-hand side in assignment');
		}
		return expression;
	}




	function ArrayLiteral() {
		var result = [AST.ARRAY];
		while (!tokenizer.test(Tokenizer.T_EOF)) {
			while (tokenizer.next(','))
				result.push([AST.UNDEFINED]);
			if (tokenizer.test(']')) break;
			result.push(AssignmentExpression());
			if (tokenizer.test(']')) break;
			if (!tokenizer.next(',')) ParseError(',', ']');
		}
		if (!tokenizer.next(']')) ParseError(']');
		return result;
	}

	function ObjectLiteral() {
		var key, result = [AST.OBJECT];
		if (!tokenizer.test('}')) do {
			if (key = tokenizer.next(tokenizer.STRING))
				key = escapeStringLiteral(key.value);
			else if (key = tokenizer.next(tokenizer.DECIMAL))
				key = String(parseFloat(key.value));
			else if (key = tokenizer.next(tokenizer.ID))
				key = key.value;
			else if (key = tokenizer.next(tokenizer.KEYWORD))
				key = key.value;
			else break;
			if (!tokenizer.next(':')) ParseError(':');
			result.push([key, AssignmentExpression()]);
		} while (tokenizer.next(','));
		if (!tokenizer.next('}')) ParseError('}');
		return result;
	}

	function FunctionExpression() {
		var args = [], name = tokenizer.next(tokenizer.ID);
		name = (name ? name.value : null);
		if (!tokenizer.next('(')) ParseError('(');
		if (!tokenizer.test(')')) do {
			var arg = tokenizer.next(tokenizer.ID);
			if (!arg) ParseError('IDENTIFIER', ')');
			args.push(arg.value);
		} while (tokenizer.next(','));
		if (!tokenizer.next(')')) ParseError(')');
		return [AST.FUNCTION, name, args, Block(true)];
	}




	function PrimaryExpression(flags) {

		if (tokenizer.next('null')) return [AST.NULL];
		if (tokenizer.next('this')) return [AST.THIS];
		if (tokenizer.next('true')) return [AST.TRUE];
		if (tokenizer.next('false')) return [AST.FALSE];

		if (tokenizer.test(tokenizer.ID))
			return [AST.SELECTOR, tokenizer.next().value];

		if (tokenizer.test(tokenizer.DECIMAL))
			return [AST.NUMBER, parseFloat(tokenizer.next().value)];

		if (tokenizer.test(tokenizer.HEX))
			return [AST.NUMBER, parseInt(tokenizer.next().value, 16)];

		if (tokenizer.test(tokenizer.STRING))
			return [AST.STRING, escapeStringLiteral(tokenizer.next().value)];

		if (tokenizer.next('(')) {
			var expression = Expression();
			if (!tokenizer.next(')')) ParseError(')');
			return [AST.PARENS, expression];
		}

		if (tokenizer.test('<')) return XMLParser();
		if (tokenizer.test('/')) return RegexpParser();

		if (tokenizer.next('[')) return ArrayLiteral();
		if (tokenizer.next('{')) return ObjectLiteral();
		if (tokenizer.next('function')) return FunctionExpression();

		if (!(flags & SILENT_FLAG)) ParseError('EXPRESSION');
	}

	function AllocationExpression(flags) {
		if (tokenizer.next('new'))
			return [AST.NEW, CallExpression()];
		else return PrimaryExpression(flags);
	}

	function CallExpression(flags) {

		var left = AllocationExpression(flags);

		if (left) while (true) {

			if (tokenizer.next('.')) {
				if (!tokenizer.test([
					tokenizer.ID,
					tokenizer.KEYWORD
				])) ParseError('identifier');
				if (left[0] !== AST.SELECTOR)
					left = [AST.SELECTOR, left];
				left.push(tokenizer.next().value);
			}

			else if (tokenizer.next('[')) {
				if (tokenizer.next(']'))
					ParseError('EXPRESSION');
				if (left[0] !== AST.SELECTOR)
					left = [AST.SELECTOR, left];
				left.push(Expression());
				if (!tokenizer.next(']')) ParseError(']');
			}

			else if (tokenizer.next('(')) {
				left = [AST.CALL, left];
				if (!tokenizer.test(')')) do {
					left.push(AssignmentExpression());
				} while (tokenizer.next(','));
				if (!tokenizer.next(')')) ParseError(')');
			}

			else break;
		}

		return left;
	}


	// precedence 3
	function PostfixExpression(flags) {
		var expression = CallExpression(flags);
		if (expression) return (
			tokenizer.next('++') &&
			[AST.INC, LHSExpression(expression, 1)] ||
			tokenizer.next('--') &&
			[AST.DEC, LHSExpression(expression, 1)] ||
			expression
		);
	}

	// precedence 4
	function UnaryExpression(flags) {
		return (
			tokenizer.next('delete') &&
			[AST.DELETE, UnaryExpression()] ||
			tokenizer.next('void') &&
			[AST.VOID, UnaryExpression()] ||
			tokenizer.next('typeof') &&
			[AST.TYPEOF, UnaryExpression()] ||
			tokenizer.next('+') &&
			[AST.UADD, UnaryExpression()] ||
			tokenizer.next('-') &&
			[AST.USUB, UnaryExpression()] ||
			tokenizer.next('~') &&
			[AST.BNOT, UnaryExpression()] ||
			tokenizer.next('!') &&
			[AST.NOT, UnaryExpression()] ||
			tokenizer.next('++') &&
			[AST.UINC, LHSExpression(UnaryExpression(), -1)] ||
			tokenizer.next('--') &&
			[AST.UDEC, LHSExpression(UnaryExpression(), -1)] ||
			PostfixExpression(flags)
		);
	}

	// precedence 5
	function MultiplicativeExpression(flags) {
		var left = UnaryExpression(flags);
		if (left) while (
			tokenizer.next('*') &&
			(left = [AST.MUL, left, UnaryExpression()]) ||
			tokenizer.next('/') &&
			(left = [AST.DIV, left, UnaryExpression()]) ||
			tokenizer.next('%') &&
			(left = [AST.MOD, left, UnaryExpression()])
		);
		return left;
	}

	// precedence 6
	function AdditiveExpression(flags) {
		var left = MultiplicativeExpression(flags);
		if (left) while (
			tokenizer.next('+') &&
			(left = [AST.ADD, left, MultiplicativeExpression()]) ||
			tokenizer.next('-') &&
			(left = [AST.SUB, left, MultiplicativeExpression()])
		);
		return left;
	}

	// precedence 7
	function ShiftExpression(flags) {
		var left = AdditiveExpression(flags);
		if (left) while (
			tokenizer.next('<<') &&
			(left = [AST.BSHL, left, AdditiveExpression()]) ||
			tokenizer.next('>>') &&
			(left = [AST.BSHR, left, AdditiveExpression()]) ||
			tokenizer.next('>>>') &&
			(left = [AST.BSHRZ, left, AdditiveExpression()])
		);
		return left;
	}

	// precedence 8
	function RelationalExpression(flags) {
		var left = ShiftExpression(flags &~ NO_IN_FLAG);
		if (flags &= NO_IN_FLAG, flags = !flags, left) while (
			(flags && tokenizer.next('in')) &&
			(left = [AST.IN, left, ShiftExpression()]) ||
			tokenizer.next('instanceof') &&
			(left = [AST.INSTANCEOF, left, ShiftExpression()]) ||
			tokenizer.next('<') &&
			(left = [AST.LT, left, ShiftExpression()]) ||
			tokenizer.next('>') &&
			(left = [AST.GT, left, ShiftExpression()]) ||
			tokenizer.next('<=') &&
			(left = [AST.LE, left, ShiftExpression()]) ||
			tokenizer.next('>=') &&
			(left = [AST.GE, left, ShiftExpression()])
		);
		return left;
	}

	// precedence 9
	function EqualityExpression(flags) {
		var left = RelationalExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('==') &&
			(left = [AST.EQ, left, RelationalExpression(flags)]) ||
			tokenizer.next('===') &&
			(left = [AST.SEQ, left, RelationalExpression(flags)]) ||
			tokenizer.next('!=') &&
			(left = [AST.NEQ, left, RelationalExpression(flags)]) ||
			tokenizer.next('!==') &&
			(left = [AST.SNEQ, left, RelationalExpression(flags)])
		);
		return left;
	}

	// precedence 10
	function BitwiseANDExpression(flags) {
		var left = EqualityExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('&') &&
			(left = [AST.BAND, left, EqualityExpression(flags)])
		);
		return left;
	}

	// precedence 11
	function BitwiseXORExpression(flags) {
		var left = BitwiseANDExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('^') &&
			(left = [AST.BXOR, left, BitwiseANDExpression(flags)])
		);
		return left;
	}

	// precedence 12
	function BitwiseORExpression(flags) {
		var left = BitwiseXORExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('|') &&
			(left = [AST.BOR, left, BitwiseXORExpression(flags)])
		);
		return left;
	}

	// precedence 13
	function LogicalANDExpression(flags) {
		var left = BitwiseORExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('&&') &&
			(left = [AST.AND, left, BitwiseORExpression(flags)])
		);
		return left;
	}

	// precedence 14
	function LogicalORExpression(flags) {
		var left = LogicalANDExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('||') &&
			(left = [AST.OR, left, LogicalANDExpression(flags)])
		);
		return left;
	}

	// precedence 15
	function ConditionalExpression(flags) {
		var expression = LogicalORExpression(flags);
		if (expression && tokenizer.next('?')) {
			expression = [AST.TERNARY, expression];
			expression.push(AssignmentExpression());
			if (!tokenizer.next(':')) ParseError(':');
			expression.push(AssignmentExpression(flags &~ SILENT_FLAG));
			return expression;
		}
		return expression;
	}

	// precedence 17
	function AssignmentExpression(flags) {
		var expression = ConditionalExpression(flags);
		if (flags &= ~SILENT_FLAG, expression) return (
			tokenizer.next('=') &&
			[AST.ASSIGN, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('*=') &&
			[AST.ASSIGN_MUL, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('/=') &&
			[AST.ASSIGN_DIV, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('%=') &&
			[AST.ASSIGN_MOD, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('+=') &&
			[AST.ASSIGN_ADD, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('-=') &&
			[AST.ASSIGN_SUB, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('<<=') &&
			[AST.ASSIGN_BSHL, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('>>=') &&
			[AST.ASSIGN_BSHR, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('>>>=') &&
			[AST.ASSIGN_BSHRZ, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('&=') &&
			[AST.ASSIGN_BAND, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('^=') &&
			[AST.ASSIGN_BXOR, LHSExpression(expression), AssignmentExpression(flags)] ||
			tokenizer.next('|=') &&
			[AST.ASSIGN_BOR, LHSExpression(expression), AssignmentExpression(flags)] ||
			expression
		);
	}

	// precedence 18
	function Expression(flags) {
		var expression = AssignmentExpression(flags);
		if (expression && tokenizer.next(',')) {
			flags &= ~SILENT_FLAG;
			expression = [AST.MULTIPLE, expression];
			do { expression.push(AssignmentExpression(flags)); }
			while (tokenizer.next(','));
		}
		return expression;
	}


	function BracketExpression() {
		if (!tokenizer.next('(')) ParseError('(');
		var expression = Expression();
		if (!tokenizer.next(')')) ParseError(')');
		return expression;
	}


	// simplify
	function DoStatement() {
		if (tokenizer.next('do')) return [
			AST.DO_LOOP, Statement(true), (
				tokenizer.next('while') &&
				BracketExpression()
			) || ParseError('while')
		];
	}

	// completed
	function WithStatement() {
		if (tokenizer.next('with')) return [
			AST.WITH,
			BracketExpression(),
			Statement(true)
		];
	}

	// completed
	function WhileStatement() {
		if (tokenizer.next('while')) return [
			AST.WHILE_LOOP,
			BracketExpression(),
			Statement(true)
		];
	}

	// completed
	function IfStatement() {
		if (tokenizer.next('if')) {
			var result = [AST.IF, BracketExpression()];
			result.push(Statement(true));
			if (tokenizer.next('else'))
				result.push(Statement(true));
			return result;
		}
	}

	// completed: refactor to simplify?
	function TryStatement() {
		if (!tokenizer.next('try')) return;
		var result = [Block(true)];
		if (tokenizer.next('catch')) {
			if (!tokenizer.next('(')) ParseError('(');
			var varName = tokenizer.next(tokenizer.ID);
			if (!varName) parseError('identifier');
			result.push(varName.value);
			if (!tokenizer.next(')')) ParseError(')');
			result.push(Block(true));
		}
		if (tokenizer.next('finally'))
			result.push(Block(true));
		if (result.length < 2) ParseError('catch', 'finally');
		return [AST.TRY, result];
	}


	// simplify!!!!
	function ForStatement() {
		if (!tokenizer.next('for')) return;
		if (!tokenizer.next('(')) ParseError('(');

		var result = (
			tokenizer.test('var') ?
			VariableStatement(NO_IN_FLAG) :
			Expression(SILENT_FLAG | NO_IN_FLAG) ||
			['EMPTY']
		);

		if (tokenizer.next(';')) {
			result = [AST.FOR_LOOP, result];
			result.push(Expression(SILENT_FLAG) || ['EMPTY']);
			if (!tokenizer.next(';')) ParseError(';');
			result.push(Expression(SILENT_FLAG) || ['EMPTY']);
		}

		else if (tokenizer.test('in')) {

			if (result[0] === AST.VAR && result.length > 2) {
				ParseError(';');
			} else tokenizer.next();


			result = [AST.FOR_IN_LOOP, result];
			result.push(Expression());
		}

		else ParseError(';', 'in');

		if (!tokenizer.next(')')) ParseError(')');
		result.push(Statement(true));
		return result;

	}

	// simplify, check for case, continue, break new lines & labels
	function SwitchStatement() {
		if (!tokenizer.next('switch')) return;
		var expression = BracketExpression();
		var caseStatements = [], defaultStatements;
		if (!tokenizer.next('{')) ParseError('{');
		if (!tokenizer.test('}')) do {

			if (tokenizer.next('case')) {
				var condition = Expression();
				if (!tokenizer.next(':')) ParseError(':');
				caseStatements.push([condition, Statements()])
			} else if (tokenizer.next('default')) {
				if (!tokenizer.next(':')) ParseError(':');
				if (defaultStatements) ParseError('more than one default');
				defaultStatements = Statements();
			} else break;

		} while (!tokenizer.test(Tokenizer.T_EOF));

		if (!tokenizer.next('}')) ParseError('}');

		return [AST.SWITCH, expression, caseStatements, defaultStatements];
	}




	function Block(required) {
		if (tokenizer.next('{')) {
			var statements = Statements();
			if (!tokenizer.next('}')) ParseError('}');
			return [AST.BLOCK, statements];
		} else if (required) ParseError('{...}');
	}



	function VariableStatement(flags) {
		if (tokenizer.next('var')) {
			var variable, variables = [AST.VAR];
			do {
				variable = tokenizer.next(tokenizer.ID);
				if (!variable) ParseError('identifier');
				variable = [variable.value];
				if (tokenizer.next('='))
					variable.push(AssignmentExpression(flags));
				variables.push(variable);
			} while (tokenizer.next(','));
			return variables;
		}
	}

	// completed: simplify
	function ThrowStatement() {
		if (tokenizer.next('throw')) {
			if (tokenizer.next(tokenizer.EOL))
				ParseError('Illegal newline after throw');
			return [AST.THROW, Expression()];
		}
	}

	// completed: simplify & check for new lines bugs
	function ReturnStatement() {
		if (tokenizer.next('return')) {
			var result = [AST.RETURN];
			var expression = Expression(SILENT_FLAG);
			if (expression) result.push(expression);
			return result;
		}
	}

	// completed: simplify & check for new lines bugs
	function BreakStatement() {
		if (tokenizer.next('break')) {
			var label = tokenizer.next(tokenizer.ID);
			if (!label) return [AST.BREAK];
			return [AST.BREAK, label.value];
		}
	}

	// completed: simplify & check for new lines bugs
	function ContinueStatement() {
		if (tokenizer.next('continue')) {
			var label = tokenizer.next(tokenizer.ID);
			if (!label) return [AST.CONTINUE];
			return [AST.CONTINUE, label.value];
		}
	}

	function LabelledStatement() {
		if (tokenizer.test(tokenizer.ID, ':')) return [
			AST.LABELLED,
			tokenizer.next().value,
			(tokenizer.next(), Statement(true))
		];
	}




	function Statement(required) {

		var result;

		if (result = Block()) return result;
		else if (result = VariableStatement());
		else if (tokenizer.next(';')) return ['EMPTY'];
		else if (result = LabelledStatement()) return result;
		else if (result = Expression(SILENT_FLAG));
		else if (result = IfStatement()) return result;

		else if (result = ForStatement()) return result;
		else if (result = DoStatement()) return result;
		else if (result = WhileStatement()) return result;

		else if (result = ContinueStatement());
		else if (result = BreakStatement());
		else if (result = ReturnStatement());
		else if (result = WithStatement()) return result;
		else if (result = SwitchStatement()) return result;
		else if (result = ThrowStatement());
		else if (result = TryStatement()) return result;

		else if (required) ParseError('STATEMENT');

		if (!tokenizer.next(';') &&
			!tokenizer.test('}') &&
			!tokenizer.test(Tokenizer.T_ERR) &&
			!tokenizer.test(Tokenizer.T_EOF) &&
			!tokenizer.next(tokenizer.EOL)) {
			ParseError(';');
		}

		return result;
	}

	function Statements() {
		var statement, statements = [];
		while (!tokenizer.test(Tokenizer.T_EOF)) {
			if (statement = Statement()) {
				statements.push(statement);
			} else break;
		}
		return statements;
	}

	function Parser(source, fName) {
		fileName = fName;
		tokenizer.tokenize(source);

		var statements = Statements();
		if (!tokenizer.test(Tokenizer.T_EOF))
			ParseError();
		return statements;

	}

	return Parser;

});