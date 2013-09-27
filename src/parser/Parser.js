define([
	'../Constants',
	'Tokens',
	'SyntaxError',
	'XMLParser',
	'RegexpParser'
], function(AST, Tokens, SyntaxError, XMLParser, RegexpParser) {

	// used to convert control characters into regular characters
	var stringEscapeRegExp = /\\(x[0-9A-F]{2}|u[0-9A-F]{4}|\n|.)/g;

	var LABELS = {};

	// disallow empty production
	var F_REQUIRED = 1 << 0;
	// allow break statement
	var F_BREAK = 1 << 1;
	// allow continue statement
	var F_CONTINUE = 1 << 2;
	// disallow "in" in expression
	var F_NOIN = 1 << 3;

	// missing octal sequences
	// missing ECMAScript 6 sequences
	// more info at: http://mathiasbynens.be/notes/javascript-escapes
	// ECMAScript 6: Unicode code point escapes
	// replaces control sequences with actual characters
	function escapeStringLiteral(string) {
		var string = string.slice(1, -1);
		return string.replace(stringEscapeRegExp, function(str, match) {
			switch (match[0]) {
				// line continuation
				case '\n': return '';
				// null character
				case '0': return String.fromCharCode(0);
				// backspace
				case 'b': return String.fromCharCode(8);
				// form feed
				case 'f': return String.fromCharCode(12);
				// new line
				case 'n': return String.fromCharCode(10);
				// carriage return
				case 'r': return String.fromCharCode(13);
				// horizontal tab
				case 't': return String.fromCharCode(9);
				// vertical tab
				case 'v': return String.fromCharCode(11);
				// hexadecimal sequence (2 digits: dd)
				case 'x': return String.fromCharCode(parseInt(match.substr(1), 16));
				// unicode sequence (4 hex digits: dddd)
				case 'u': return String.fromCharCode(parseInt(match.substr(1), 16));
				// by default return escaped character "as is"
				default: return match;
			}
		});
	}

	function FunctionParameters() {
		var arg, args = [];
		if (!Tokens.next('(')) SyntaxError();
		if (!Tokens.test(')')) do {
			arg = Tokens.next(Tokens.ID);
			if (arg) args.push(arg.value)
			else SyntaxError();
		} while (Tokens.next(','));
		if (!Tokens.next(')')) SyntaxError();
		return args;
	}

	function FunctionBody() {
		if (!Tokens.next('{'))
			SyntaxError();
		var result = Statements();
		if (!Tokens.next('}'))
			SyntaxError();
		return result;
	}


	function LHSExpression(expression, position) {
		while (expression[0] === AST.PARENS)
			expression = expression[1];
		if (expression[0] !== AST.SELECTOR) {
			if (position === -1) SyntaxError('bad_lhs_prefix');
			if (position === 1) SyntaxError('bad_lhs_postfix');
			SyntaxError('bad_lhs_assign');
		}
		return expression;
	}



	// wise to use AST.EMPTY instead of AST.UNDEFINED?
	function ArrayLiteral() {
		var result = [AST.ARRAY];
		while (!Tokens.test(Tokens.$EOF)) {
			while (Tokens.next(','))
				result.push([AST.UNDEFINED]);
			if (Tokens.test(']')) break;
			// parse required expression
			result.push(AssignmentExpression(F_REQUIRED));
			if (Tokens.test(']')) break;
			if (!Tokens.next(',')) SyntaxError();
		}
		if (!Tokens.next(']')) SyntaxError();
		return result;
	}


	function ObjectLiteral() {
		var key, result = [AST.OBJECT];
		if (!Tokens.test('}')) do {
			if (key = Tokens.next(Tokens.STRING))
				key = escapeStringLiteral(key.value);
			else if (key = Tokens.next(Tokens.DECIMAL))
				key = String(parseFloat(key.value));
			else if (key = Tokens.next(Tokens.ID))
				key = key.value;
			else if (key = Tokens.next(Tokens.KEYWORD))
				key = key.value;
			else break;
			if (!Tokens.next(':')) SyntaxError();
			// parse required expression
			result.push([key, AssignmentExpression(F_REQUIRED)]);
		} while (Tokens.next(','));
		if (!Tokens.next('}')) SyntaxError();
		return result;
	}

	function FunctionExpression() {

		var args = [], result = [AST.FUNCTION],
			name = Tokens.next(Tokens.ID);

		result.push(name ? name.value : null);

		var saveLabels = LABELS;
		LABELS = {};

		result.push(
			FunctionParameters(),
			FunctionBody()
		);

		LABELS = saveLabels;

		return result;
	}


	function PrimaryExpression(flags) {

		if (Tokens.next('null')) return [AST.NULL];
		if (Tokens.next('this')) return [AST.THIS];
		if (Tokens.next('true')) return [AST.TRUE];
		if (Tokens.next('false')) return [AST.FALSE];

		if (Tokens.test(Tokens.ID))
			return [AST.SELECTOR, Tokens.next().value];
		if (Tokens.test(Tokens.DECIMAL))
			return [AST.NUMBER, parseFloat(Tokens.next().value)];
		if (Tokens.test(Tokens.HEX))
			return [AST.NUMBER, parseInt(Tokens.next().value, 16)];
		if (Tokens.test(Tokens.STRING))
			return [AST.STRING, escapeStringLiteral(Tokens.next().value)];

		if (Tokens.next('(')) {
			var expression = Expression(F_REQUIRED);
			if (!Tokens.next(')')) SyntaxError();
			return [AST.PARENS, expression];
		}

		if (Tokens.test('<')) return XMLParser();
		if (Tokens.test('/')) return RegexpParser();

		if (Tokens.next('[')) return ArrayLiteral();
		if (Tokens.next('{')) return ObjectLiteral();
		if (Tokens.next('function')) return FunctionExpression();

		if (flags & F_REQUIRED) SyntaxError();
	}

	function AllocationExpression(flags) {
		if (Tokens.next('new')) return [
			AST.NEW, CallExpression(F_REQUIRED)
		]; else return PrimaryExpression(flags);
	}

	function CallExpression(flags) {

		var left = AllocationExpression(flags);

		if (left) while (true) {

			if (Tokens.next('.')) {
				if (!Tokens.test([
					Tokens.ID,
					Tokens.KEYWORD
				])) SyntaxError();
				if (left[0] !== AST.SELECTOR)
					left = [AST.SELECTOR, left];
				left.push(Tokens.next().value);
			}

			else if (Tokens.next('[')) {
				if (Tokens.test(']')) SyntaxError();
				if (left[0] !== AST.SELECTOR)
					left = [AST.SELECTOR, left];
				left.push(Expression(F_REQUIRED));
				if (!Tokens.next(']')) SyntaxError();
			}

			else if (Tokens.next('(')) {
				left = [AST.CALL, left];
				if (!Tokens.test(')')) do {
					left.push(AssignmentExpression(F_REQUIRED));
				} while (Tokens.next(','));
				if (!Tokens.next(')')) SyntaxError();
			}

			else break;
		}

		return left;
	}

	// precedence 3
	function PostfixExpression(flags) {
		var expression = CallExpression(flags);
		if (!expression) return;
		// new line completes the expression
		if (Tokens.test(Tokens.EOL)) return expression;
		return (
			Tokens.next('++') &&
			[AST.INC, LHSExpression(expression, 1)] ||
			Tokens.next('--') &&
			[AST.DEC, LHSExpression(expression, 1)] ||
			expression
		);
	}

	// precedence 4
	function UnaryExpression(flags) {
		return (
			Tokens.next('delete') &&
			[AST.DELETE, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('void') &&
			[AST.VOID, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('typeof') &&
			[AST.TYPEOF, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('+') &&
			[AST.UADD, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('-') &&
			[AST.USUB, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('~') &&
			[AST.BNOT, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('!') &&
			[AST.NOT, UnaryExpression(F_REQUIRED)] ||
			Tokens.next('++') &&
			[AST.UINC, LHSExpression(UnaryExpression(F_REQUIRED), -1)] ||
			Tokens.next('--') &&
			[AST.UDEC, LHSExpression(UnaryExpression(F_REQUIRED), -1)] ||
			PostfixExpression(flags)
		);
	}

	// precedence 5
	function MultiplicativeExpression(flags) {
		var left = UnaryExpression(flags);
		if (left) while (
			Tokens.next('*') &&
			(left = [AST.MUL, left, UnaryExpression(F_REQUIRED)]) ||
			Tokens.next('/') &&
			(left = [AST.DIV, left, UnaryExpression(F_REQUIRED)]) ||
			Tokens.next('%') &&
			(left = [AST.MOD, left, UnaryExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 6
	function AdditiveExpression(flags) {
		var left = MultiplicativeExpression(flags);
		if (left) while (
			Tokens.next('+') &&
			(left = [AST.ADD, left, MultiplicativeExpression(F_REQUIRED)]) ||
			Tokens.next('-') &&
			(left = [AST.SUB, left, MultiplicativeExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 7
	function ShiftExpression(flags) {
		var left = AdditiveExpression(flags);
		if (left) while (
			Tokens.next('<<') &&
			(left = [AST.BSHL, left, AdditiveExpression(F_REQUIRED)]) ||
			Tokens.next('>>') &&
			(left = [AST.BSHR, left, AdditiveExpression(F_REQUIRED)]) ||
			Tokens.next('>>>') &&
			(left = [AST.BSHRZ, left, AdditiveExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 8
	function RelationalExpression(flags) {
		var inAllowed = !(flags & F_NOIN);
		var left = ShiftExpression(flags &~ F_NOIN);
		if (left) while (
			(inAllowed && Tokens.next('in')) &&
			(left = [AST.IN, left, ShiftExpression(F_REQUIRED)]) ||
			Tokens.next('instanceof') &&
			(left = [AST.INSTANCEOF, left, ShiftExpression(F_REQUIRED)]) ||
			Tokens.next('<') &&
			(left = [AST.LT, left, ShiftExpression(F_REQUIRED)]) ||
			Tokens.next('>') &&
			(left = [AST.GT, left, ShiftExpression(F_REQUIRED)]) ||
			Tokens.next('<=') &&
			(left = [AST.LE, left, ShiftExpression(F_REQUIRED)]) ||
			Tokens.next('>=') &&
			(left = [AST.GE, left, ShiftExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 9
	function EqualityExpression(flags) {
		var left = RelationalExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			Tokens.next('==') &&
			(left = [AST.EQ, left, RelationalExpression(flags)]) ||
			Tokens.next('===') &&
			(left = [AST.SEQ, left, RelationalExpression(flags)]) ||
			Tokens.next('!=') &&
			(left = [AST.NEQ, left, RelationalExpression(flags)]) ||
			Tokens.next('!==') &&
			(left = [AST.SNEQ, left, RelationalExpression(flags)])
		);
		return left;
	}

	// precedence 10
	function BitwiseANDExpression(flags) {
		var left = EqualityExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			Tokens.next('&') &&
			(left = [AST.BAND, left, EqualityExpression(flags)])
		);
		return left;
	}

	// precedence 11
	function BitwiseXORExpression(flags) {
		var left = BitwiseANDExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			Tokens.next('^') &&
			(left = [AST.BXOR, left, BitwiseANDExpression(flags)])
		);
		return left;
	}

	// precedence 12
	function BitwiseORExpression(flags) {
		var left = BitwiseXORExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			Tokens.next('|') &&
			(left = [AST.BOR, left, BitwiseXORExpression(flags)])
		);
		return left;
	}

	// precedence 13
	function LogicalANDExpression(flags) {
		var left = BitwiseORExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			Tokens.next('&&') &&
			(left = [AST.AND, left, BitwiseORExpression(flags)])
		);
		return left;
	}

	// precedence 14
	function LogicalORExpression(flags) {
		var left = LogicalANDExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			Tokens.next('||') &&
			(left = [AST.OR, left, LogicalANDExpression(flags)])
		);
		return left;
	}

	// precedence 15
	function ConditionalExpression(flags) {
		var expression = LogicalORExpression(flags);
		if (flags |= F_REQUIRED, expression && Tokens.next('?')) {
			expression = [AST.TERNARY, expression];
			expression.push(AssignmentExpression(flags));
			if (!Tokens.next(':')) SyntaxError();
			expression.push(AssignmentExpression(flags));
			return expression;
		}
		return expression;
	}

	// precedence 17
	function AssignmentExpression(flags) {
		var expression = ConditionalExpression(flags);
		if (flags |= F_REQUIRED, expression) return (
			Tokens.next('=') &&
			[AST.ASSIGN, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('*=') &&
			[AST.ASSIGN_MUL, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('/=') &&
			[AST.ASSIGN_DIV, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('%=') &&
			[AST.ASSIGN_MOD, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('+=') &&
			[AST.ASSIGN_ADD, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('-=') &&
			[AST.ASSIGN_SUB, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('<<=') &&
			[AST.ASSIGN_BSHL, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('>>=') &&
			[AST.ASSIGN_BSHR, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('>>>=') &&
			[AST.ASSIGN_BSHRZ, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('&=') &&
			[AST.ASSIGN_BAND, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('^=') &&
			[AST.ASSIGN_BXOR, LHSExpression(expression), AssignmentExpression(flags)] ||
			Tokens.next('|=') &&
			[AST.ASSIGN_BOR, LHSExpression(expression), AssignmentExpression(flags)] ||
			expression
		);
	}

	// precedence 18
	function Expression(flags) {
		var expression = AssignmentExpression(flags);
		if (flags |= F_REQUIRED, expression && Tokens.next(',')) {
			expression = [AST.MULTIPLE, expression];
			do { expression.push(AssignmentExpression(flags)); }
			while (Tokens.next(','));
		}
		return expression;
	}


	function DoStatement(flags) {
		var result = [AST.DO_LOOP];
		result.push(Statement(flags | F_BREAK | F_CONTINUE | F_REQUIRED));
		if (!Tokens.next('while')) SyntaxError();
		if (!Tokens.next('(')) SyntaxError();
		result.push(Expression(F_REQUIRED));
		if (!Tokens.next(')')) SyntaxError();
		return result;
	}

	function WithStatement(flags) {
		var result = [AST.WITH];
		if (!Tokens.next('(')) SyntaxError();
		result.push(Expression(F_REQUIRED));
		if (!Tokens.next(')')) SyntaxError();
		result.push(Statement(flags | F_REQUIRED));
		return result;
	}

	function WhileStatement(flags) {
		var result = [AST.WHILE_LOOP];
		if (!Tokens.next('(')) SyntaxError();
		result.push(Expression(F_REQUIRED));
		if (!Tokens.next(')')) SyntaxError();
		result.push(Statement(flags | F_BREAK | F_CONTINUE | F_REQUIRED));
		return result;
	}

	function IfStatement(flags) {
		var result = [AST.IF];
		if (!Tokens.next('(')) SyntaxError();
		result.push(Expression(F_REQUIRED));
		if (!Tokens.next(')')) SyntaxError();
		result.push(Statement(flags |= F_REQUIRED));
		if (Tokens.next('else'))
			result.push(Statement(flags));
		return result;
	}

	// INCOMPLETE AT ALL: simplify!!!!
	function ForStatement() {
		if (!Tokens.next('(')) SyntaxError();

		var result = (
			Tokens.next('var') ?
			VariableStatement(F_NOIN) :
			Expression(F_NOIN) ||
			['EMPTY']
		);

		if (Tokens.next(';')) {
			result = [AST.FOR_LOOP, result];
			result.push(Expression() || ['EMPTY']);
			if (!Tokens.next(';')) SyntaxError();
			result.push(Expression() || ['EMPTY']);
		}

		else if (Tokens.test('in')) {

			if (result[0] === AST.VAR && result.length > 2) {
				SyntaxError();
			} else Tokens.next();


			result = [AST.FOR_IN_LOOP, result];
			result.push(Expression());
		}

		else SyntaxError();

		if (!Tokens.next(')')) SyntaxError();

		// parse required statement
		result.push(Statement(true));
		return result;

	}

	// INCOMPLETE AT ALL: simplify, check for case, continue, break new lines & labels
	function SwitchStatement() {
		if (!Tokens.next('(')) SyntaxError();
		var expression = Expression(F_REQUIRED);
		if (!Tokens.next(')')) SyntaxError();
		var caseStatements = [], defaultStatements;
		if (!Tokens.next('{')) SyntaxError();
		if (!Tokens.test('}')) do {

			if (Tokens.next('case')) {
				var condition = Expression();
				if (!Tokens.next(':')) SyntaxError();
				caseStatements.push([condition, Statements()])
			} else if (Tokens.next('default')) {
				if (!Tokens.next(':')) SyntaxError();
				if (defaultStatements)
					SyntaxError('double_switch_default');
				defaultStatements = Statements();
			} else break;

		} while (!Tokens.test(Tokens.$EOF));

		if (!Tokens.next('}')) SyntaxError();

		return [AST.SWITCH, expression, caseStatements, defaultStatements];
	}




	function Block(flags) {
		// parse optional statement list
		var statements = Statements(flags &= ~F_REQUIRED);
		if (!Tokens.next('}')) SyntaxError();
		return [AST.BLOCK, statements];
	}

	function VariableStatement(flags) {

		var variable, variables = [AST.VAR];
		flags |= F_REQUIRED;

		do {
			variable = Tokens.next(Tokens.ID);
			if (!variable) SyntaxError();
			variable = [variable.value];
			if (Tokens.next('=')) {
				// parse required expression
				variable.push(AssignmentExpression(flags));
			}
			variables.push(variable);
		} while (Tokens.next(','));
		return variables;
	}

	function ReturnStatement() {
		var result = [AST.RETURN];
		// new line completes the statement
		if (Tokens.test(Tokens.EOL)) return result;
		// parse optional expression
		var expression = Expression();
		if (expression) result.push(expression);
		return result;
	}

	function ThrowStatement() {
		// new line is not allowed here
		if (Tokens.next(Tokens.EOL))
			SyntaxError('bad_throw_eol');
		// parse required expression
		return [AST.THROW, Expression(F_REQUIRED)];
	}

	function TryStatement(flags) {

		var result = [AST.TRY];

		flags &= ~F_REQUIRED;


		if (!Tokens.next('{')) SyntaxError();
		result.push(Statements(flags));
		if (!Tokens.next('}')) SyntaxError();


		if (Tokens.next('catch')) {
			if (!Tokens.next('(')) SyntaxError();
			var varName = Tokens.next(Tokens.ID);
			if (!varName) SyntaxError();
			result.push(varName.value);
			if (!Tokens.next(')')) SyntaxError();
			if (!Tokens.next('{')) SyntaxError();
			result.push(Statements(flags));
			if (!Tokens.next('}')) SyntaxError();
			if (Tokens.next('finally')) {
				if (!Tokens.next('{')) SyntaxError();
				result.push(Statements(flags));
				if (!Tokens.next('}')) SyntaxError();
			}
		}

		else if (Tokens.next('finally')) {
			if (!Tokens.next('{')) SyntaxError();
			result.push(Statements(flags));
			if (!Tokens.next('}')) SyntaxError();
		}

		else SyntaxError('try_no_catchfinally');

		return result;
	}

	function LabelledStatement(flags) {
		// init variables
		var c, label, result = [AST.LABELLED], labels = [];

		// loop 'till two next tokens looks like a label
		while (label = Tokens.next(Tokens.ID, ':'))
			labels.push(label[0].value);

		// exit if there was no labels
		if (!labels.length) return;

		// check if this statement labels a loop statement
		var isLabelledLoop = Tokens.test(['do', 'while', 'for']);

		// save all defined labels
		for (var c = 0; c < labels.length; c++) {
			// check for duplicate labels
			if (LABELS.hasOwnProperty(label = labels[c]))
				SyntaxError('dup_label', label);
			// save label and labelled loop flag
			LABELS[label] = isLabelledLoop;
		}

		result.push(labels);

		// parse required label statement
		result.push(Statement(flags |= F_REQUIRED));

		// remove all defined labels
		for (var c = 1; c < labels.length; c++)
			delete LABELS[labels[c]];

		return result;
	}

	function BreakStatement(flags) {
		var label;

		// new line completes the statement
		if (!Tokens.test(Tokens.EOL)) {
			if (label = Tokens.next(Tokens.ID)) {
				label = label.value
			}
		}

		// check if break is allowed here
		if (!label && !(flags & F_BREAK))
			SyntaxError('bad_break');

		// check for undefined label
		if (label && !LABELS.hasOwnProperty(label))
			SyntaxError('undef_label', label);

		return (label ? [AST.BREAK, label] : [AST.BREAK]);
	}

	function ContinueStatement(flags) {
		var label;

		// new line completes the statement
		if (!Tokens.test(Tokens.EOL)) {
			if (label = Tokens.next(Tokens.ID)) {
				label = label.value
			}
		}

		// check if continue is allowed here
		if (!(flags & F_CONTINUE))
			SyntaxError('bad_continue');

		// check for undefined label
		if (label && !LABELS[label])
			SyntaxError('undef_label', label);

		return (label ? [AST.CONTINUE, label] : [AST.CONTINUE]);
	}



	function FunctionStatement(flags) {
		var result = Tokens.next(Tokens.ID);
		if (!result) SyntaxError();
		return [
			'FUNC_DECL',
			result.value,
			FunctionParameters(),
			FunctionBody()
		];
	}




	function Statement(flags) {

		var isRequired = flags & F_REQUIRED;
		flags &= ~F_REQUIRED;


		if (Tokens.next(';')) return ['EMPTY'];
		if (Tokens.next('{')) return Block(flags);
		if (Tokens.next('if')) return IfStatement(flags);
		if (Tokens.next('for')) return ForStatement(flags);
		if (Tokens.next('do')) return DoStatement(flags);
		if (Tokens.next('while')) return WhileStatement(flags);
		if (Tokens.next('with')) return WithStatement(flags);
		if (Tokens.next('try')) return TryStatement(flags);
		if (Tokens.next('switch')) return SwitchStatement(flags);
		if (Tokens.next('function')) return FunctionStatement(flags);

		if (result = LabelledStatement(flags)) return result;


		if (Tokens.next('var'))
			result = VariableStatement(flags);

		else if (Tokens.next('return'))
			result = ReturnStatement(flags);

		else if (Tokens.next('throw'))
			result = ThrowStatement(flags);

		else if (Tokens.next('continue'))
			result = ContinueStatement(flags);

		else if (Tokens.next('break'))
			result = BreakStatement(flags);

		else if (result = Expression(flags));

		else if (isRequired) SyntaxError();

		if (!Tokens.next(';') &&
			!Tokens.test('}') &&
			!Tokens.test(Tokens.$ERR) &&
			!Tokens.test(Tokens.$EOF) &&
			!Tokens.next(Tokens.EOL)) {
			SyntaxError();
		}

		return result;
	}

	function Statements(flags) {
		var statement, statements = [];
		while (!Tokens.test(Tokens.$EOF)) {
			if (statement = Statement(flags))
				statements.push(statement);
			else break;
		}
		return statements;
	}

	function Parser(source, fName) {
		Tokens.init(source, fName);
		LABELS = {};
		var statements = Statements();
		if (!Tokens.test(Tokens.$EOF)) SyntaxError();
		return statements;
	}

	return Parser;

});