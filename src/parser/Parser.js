define([
	'../Constants',
	'TokenStream',
	'SyntaxError',
	'XMLParser',
	'RegexpParser'
], function(AST, tokenizer, SyntaxError, XMLParser, RegexpParser) {

	var Tokenizer = tokenizer.constructor;
	var T_EOF = Tokenizer.T_EOF;
	var T_ERR = Tokenizer.T_ERR;

	// used to convert control characters into regular characters
	var stringEscape = /\\(x[0-9A-F]{2}|u[0-9A-F]{4}|.)/g;

	var LABELS = {};

	// disallow empty production
	var F_REQUIRED = 1 << 0;
	// allow break statement
	var F_BREAK = 1 << 1;
	// allow continue statement
	var F_CONTINUE = 1 << 2;
	// disallow "in" in expression
	var F_NOIN = 1 << 3;


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




	function ArrayLiteral() {
		var result = [AST.ARRAY];
		while (!tokenizer.test(T_EOF)) {
			while (tokenizer.next(','))
				result.push([AST.UNDEFINED]);
			if (tokenizer.test(']')) break;
			// parse required expression
			result.push(AssignmentExpression(F_REQUIRED));
			if (tokenizer.test(']')) break;
			if (!tokenizer.next(',')) SyntaxError();
		}
		if (!tokenizer.next(']')) SyntaxError();
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
			if (!tokenizer.next(':')) SyntaxError();
			// parse required expression
			result.push([key, AssignmentExpression(F_REQUIRED)]);
		} while (tokenizer.next(','));
		if (!tokenizer.next('}')) SyntaxError();
		return result;
	}

	function FunctionExpression() {
		var args = [], name = tokenizer.next(tokenizer.ID);
		name = (name ? name.value : null);
		if (!tokenizer.next('(')) SyntaxError();
		if (!tokenizer.test(')')) do {
			var arg = tokenizer.next(tokenizer.ID);
			if (!arg) SyntaxError();
			args.push(arg.value);
		} while (tokenizer.next(','));
		if (!tokenizer.next(')')) SyntaxError();
		return [AST.FUNCTION, name, args, Block(F_REQUIRED)];
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
			var expression = Expression(F_REQUIRED);
			if (!tokenizer.next(')')) SyntaxError();
			return [AST.PARENS, expression];
		}

		if (tokenizer.test('<')) return XMLParser();
		if (tokenizer.test('/')) return RegexpParser();

		if (tokenizer.next('[')) return ArrayLiteral();
		if (tokenizer.next('{')) return ObjectLiteral();
		if (tokenizer.next('function')) return FunctionExpression();

		if (flags & F_REQUIRED) SyntaxError();
	}

	function AllocationExpression(flags) {
		if (tokenizer.next('new')) return [
			AST.NEW, CallExpression(F_REQUIRED)
		]; else return PrimaryExpression(flags);
	}

	function CallExpression(flags) {

		var left = AllocationExpression(flags);

		if (left) while (true) {

			if (tokenizer.next('.')) {
				if (!tokenizer.test([
					tokenizer.ID,
					tokenizer.KEYWORD
				])) SyntaxError();
				if (left[0] !== AST.SELECTOR)
					left = [AST.SELECTOR, left];
				left.push(tokenizer.next().value);
			}

			else if (tokenizer.next('[')) {
				if (tokenizer.test(']'))
					SyntaxError();
				else tokenizer.next();
				if (left[0] !== AST.SELECTOR)
					left = [AST.SELECTOR, left];
				left.push(Expression(F_REQUIRED));
				if (!tokenizer.next(']')) SyntaxError();
			}

			else if (tokenizer.next('(')) {
				left = [AST.CALL, left];
				if (!tokenizer.test(')')) do {
					left.push(AssignmentExpression(F_REQUIRED));
				} while (tokenizer.next(','));
				if (!tokenizer.next(')')) SyntaxError();
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
			[AST.DELETE, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('void') &&
			[AST.VOID, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('typeof') &&
			[AST.TYPEOF, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('+') &&
			[AST.UADD, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('-') &&
			[AST.USUB, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('~') &&
			[AST.BNOT, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('!') &&
			[AST.NOT, UnaryExpression(F_REQUIRED)] ||
			tokenizer.next('++') &&
			[AST.UINC, LHSExpression(UnaryExpression(F_REQUIRED), -1)] ||
			tokenizer.next('--') &&
			[AST.UDEC, LHSExpression(UnaryExpression(F_REQUIRED), -1)] ||
			PostfixExpression(flags)
		);
	}

	// precedence 5
	function MultiplicativeExpression(flags) {
		var left = UnaryExpression(flags);
		if (left) while (
			tokenizer.next('*') &&
			(left = [AST.MUL, left, UnaryExpression(F_REQUIRED)]) ||
			tokenizer.next('/') &&
			(left = [AST.DIV, left, UnaryExpression(F_REQUIRED)]) ||
			tokenizer.next('%') &&
			(left = [AST.MOD, left, UnaryExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 6
	function AdditiveExpression(flags) {
		var left = MultiplicativeExpression(flags);
		if (left) while (
			tokenizer.next('+') &&
			(left = [AST.ADD, left, MultiplicativeExpression(F_REQUIRED)]) ||
			tokenizer.next('-') &&
			(left = [AST.SUB, left, MultiplicativeExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 7
	function ShiftExpression(flags) {
		var left = AdditiveExpression(flags);
		if (left) while (
			tokenizer.next('<<') &&
			(left = [AST.BSHL, left, AdditiveExpression(F_REQUIRED)]) ||
			tokenizer.next('>>') &&
			(left = [AST.BSHR, left, AdditiveExpression(F_REQUIRED)]) ||
			tokenizer.next('>>>') &&
			(left = [AST.BSHRZ, left, AdditiveExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 8
	function RelationalExpression(flags) {
		var inAllowed = !(flags & F_NOIN);
		var left = ShiftExpression(flags &~ F_NOIN);
		if (left) while (
			(inAllowed && tokenizer.next('in')) &&
			(left = [AST.IN, left, ShiftExpression(F_REQUIRED)]) ||
			tokenizer.next('instanceof') &&
			(left = [AST.INSTANCEOF, left, ShiftExpression(F_REQUIRED)]) ||
			tokenizer.next('<') &&
			(left = [AST.LT, left, ShiftExpression(F_REQUIRED)]) ||
			tokenizer.next('>') &&
			(left = [AST.GT, left, ShiftExpression(F_REQUIRED)]) ||
			tokenizer.next('<=') &&
			(left = [AST.LE, left, ShiftExpression(F_REQUIRED)]) ||
			tokenizer.next('>=') &&
			(left = [AST.GE, left, ShiftExpression(F_REQUIRED)])
		);
		return left;
	}

	// precedence 9
	function EqualityExpression(flags) {
		var left = RelationalExpression(flags);
		if (flags |= F_REQUIRED, left) while (
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
		if (flags |= F_REQUIRED, left) while (
			tokenizer.next('&') &&
			(left = [AST.BAND, left, EqualityExpression(flags)])
		);
		return left;
	}

	// precedence 11
	function BitwiseXORExpression(flags) {
		var left = BitwiseANDExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			tokenizer.next('^') &&
			(left = [AST.BXOR, left, BitwiseANDExpression(flags)])
		);
		return left;
	}

	// precedence 12
	function BitwiseORExpression(flags) {
		var left = BitwiseXORExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			tokenizer.next('|') &&
			(left = [AST.BOR, left, BitwiseXORExpression(flags)])
		);
		return left;
	}

	// precedence 13
	function LogicalANDExpression(flags) {
		var left = BitwiseORExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			tokenizer.next('&&') &&
			(left = [AST.AND, left, BitwiseORExpression(flags)])
		);
		return left;
	}

	// precedence 14
	function LogicalORExpression(flags) {
		var left = LogicalANDExpression(flags);
		if (flags |= F_REQUIRED, left) while (
			tokenizer.next('||') &&
			(left = [AST.OR, left, LogicalANDExpression(flags)])
		);
		return left;
	}

	// precedence 15
	function ConditionalExpression(flags) {
		var expression = LogicalORExpression(flags);
		if (flags |= F_REQUIRED, expression && tokenizer.next('?')) {
			expression = [AST.TERNARY, expression];
			expression.push(AssignmentExpression(flags));
			if (!tokenizer.next(':')) SyntaxError();
			expression.push(AssignmentExpression(flags));
			return expression;
		}
		return expression;
	}

	// precedence 17
	function AssignmentExpression(flags) {
		var expression = ConditionalExpression(flags);
		if (flags |= F_REQUIRED, expression) return (
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
		if (flags |= F_REQUIRED, expression && tokenizer.next(',')) {
			expression = [AST.MULTIPLE, expression];
			do { expression.push(AssignmentExpression(flags)); }
			while (tokenizer.next(','));
		}
		return expression;
	}






	function BracketExpression() {
		if (!tokenizer.next('(')) SyntaxError();
		var expression = Expression(F_REQUIRED);
		if (!tokenizer.next(')')) SyntaxError();
		return expression;
	}


	function DoStatement(flags) {
		if (!tokenizer.next('do')) return;
		var statement = Statement(flags | F_BREAK | F_REQUIRED);
		if (!tokenizer.next('while')) SyntaxError();
		var expression = BracketExpression();
		return [AST.DO_LOOP, statement, expression];
	}

	function WithStatement(flags) {
		if (!tokenizer.next('with')) return;
		var expression = BracketExpression();
		var statement = Statement(flags | F_REQUIRED);
		return [AST.WITH, expression, statement];
	}

	function WhileStatement(flags) {
		if (!tokenizer.next('while')) return;
		var expression = BracketExpression();
		var statement = Statement(flags | F_BREAK | F_CONTINUE | F_REQUIRED);
		return [AST.WHILE_LOOP, expression, statement];
	}

	// simplify
	function IfStatement(flags) {
		if (!tokenizer.next('if')) return;
		// parse required bracket expression
		var result = [AST.IF, BracketExpression()];
		// parse required if statement
		result.push(Statement(flags |= F_REQUIRED));
		if (tokenizer.next('else')) {
			// parse required else statement
			result.push(Statement(flags));
		}
		return result;
	}

	// INCOMPLETE AT ALL: simplify!!!!
	function ForStatement() {
		if (!tokenizer.next('for')) return;
		if (!tokenizer.next('(')) SyntaxError();

		var result = (
			tokenizer.test('var') ?
			VariableStatement(NO_IN_FLAG) :
			Expression(SILENT_FLAG | NO_IN_FLAG) ||
			['EMPTY']
		);

		if (tokenizer.next(';')) {
			result = [AST.FOR_LOOP, result];
			result.push(Expression() || ['EMPTY']);
			if (!tokenizer.next(';')) SyntaxError();
			result.push(Expression() || ['EMPTY']);
		}

		else if (tokenizer.test('in')) {

			if (result[0] === AST.VAR && result.length > 2) {
				SyntaxError();
			} else tokenizer.next();


			result = [AST.FOR_IN_LOOP, result];
			result.push(Expression());
		}

		else SyntaxError();

		if (!tokenizer.next(')')) SyntaxError();

		// parse required statement
		result.push(Statement(true));
		return result;

	}

	// INCOMPLETE AT ALL: simplify, check for case, continue, break new lines & labels
	function SwitchStatement() {
		if (!tokenizer.next('switch')) return;
		var expression = BracketExpression();
		var caseStatements = [], defaultStatements;
		if (!tokenizer.next('{')) SyntaxError();
		if (!tokenizer.test('}')) do {

			if (tokenizer.next('case')) {
				var condition = Expression();
				if (!tokenizer.next(':')) SyntaxError();
				caseStatements.push([condition, Statements()])
			} else if (tokenizer.next('default')) {
				if (!tokenizer.next(':')) SyntaxError();
				if (defaultStatements)
					SyntaxError('double_switch_default');
				defaultStatements = Statements();
			} else break;

		} while (!tokenizer.test(T_EOF));

		if (!tokenizer.next('}')) SyntaxError();

		return [AST.SWITCH, expression, caseStatements, defaultStatements];
	}




	function Block(flags) {
		if (tokenizer.next('{')) {
			// parse optional statement list
			var statements = Statements(flags &= ~F_REQUIRED);
			if (!tokenizer.next('}')) SyntaxError();
			return [AST.BLOCK, statements];
		} else if (flags & F_REQUIRED) SyntaxError();
	}

	function VariableStatement(flags) {

		var variable, variables = [AST.VAR];
		flags |= F_REQUIRED;

		do {
			variable = tokenizer.next(tokenizer.ID);
			if (!variable) SyntaxError();
			variable = [variable.value];
			if (tokenizer.next('=')) {
				// parse required expression
				variable.push(AssignmentExpression(flags));
			}
			variables.push(variable);
		} while (tokenizer.next(','));
		return variables;
	}

	function ReturnStatement() {
		var result = [AST.RETURN];
		// new line completes the statement
		if (tokenizer.test(tokenizer.EOL)) return result;
		// parse optional expression
		var expression = Expression();
		if (expression) result.push(expression);
		return result;
	}

	function ThrowStatement() {
		// new line is not allowed here
		if (tokenizer.next(tokenizer.EOL))
			SyntaxError('bad_throw_eol');
		// parse required expression
		return [AST.THROW, Expression(F_REQUIRED)];
	}

	function TryStatement(flags) {

		var result = [AST.TRY, Block(flags |= F_REQUIRED)];

		if (tokenizer.next('catch')) {
			if (!tokenizer.next('(')) SyntaxError();
			var varName = tokenizer.next(tokenizer.ID);
			if (!varName) SyntaxError();
			result.push(varName.value);
			if (!tokenizer.next(')')) SyntaxError();
			result.push(Block(flags));
			if (tokenizer.next('finally'))
				result.push(Block(flags));
		}

		else if (tokenizer.next('finally'))
			result.push(Block(flags));

		else SyntaxError('try_no_catchfinally');

		return result;
	}

	function LabelledStatement(flags) {
		var label = tokenizer.next(tokenizer.ID, ':');
		if (label) label = label[0].value; else return;

		// check if we already have this label
		if (LABELS.hasOwnProperty(label))
			SyntaxError('dup_label', label);

		// save label
		LABELS[label] = true;

		// parse required label statement
		var statement = Statement(flags |= F_REQUIRED);

		// remove label
		delete LABELS[label];

		return [AST.LABELLED, label, statement];
	}

	function BreakStatement(flags) {
		var label;

		// new line completes the statement
		if (!tokenizer.test(tokenizer.EOL)) {
			if (label = tokenizer.next(tokenizer.ID)) {
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
		if (!tokenizer.test(tokenizer.EOL)) {
			if (label = tokenizer.next(tokenizer.ID)) {
				label = label.value
			}
		}

		// check if continue is allowed here
		if (!(flags & F_CONTINUE))
			SyntaxError('bad_continue');

		// check for undefined label
		if (label && !LABELS.hasOwnProperty(label))
			SyntaxError('undef_label', label);

		return (label ? [AST.CONTINUE, label] : [AST.CONTINUE]);
	}




	function Statement(flags) {

		var isRequired = flags & F_REQUIRED;
		flags &= ~F_REQUIRED;

		if (result = Block(flags)) return result;

		else if (tokenizer.next(';')) return ['EMPTY'];
		else if (result = LabelledStatement(flags)) return result;
		else if (result = Expression(flags));
		else if (result = IfStatement(flags)) return result;

		else if (result = ForStatement(flags)) return result;
		else if (result = DoStatement(flags)) return result;
		else if (result = WhileStatement(flags)) return result;

		else if (tokenizer.next('var'))
			result = VariableStatement(flags);



		else if (tokenizer.next('return'))
			result = ReturnStatement(flags);
		else if (tokenizer.next('throw'))
			result = ThrowStatement(flags);

		else if (tokenizer.next('continue'))
			result = ContinueStatement(flags);
		else if (tokenizer.next('break'))
			result = BreakStatement(flags);

		else if (result = WithStatement(flags)) return result;
		else if (result = SwitchStatement(flags)) return result;

		else if (tokenizer.next('try'))
			return TryStatement(flags);

		else if (isRequired) SyntaxError();

		if (!tokenizer.next(';') &&
			!tokenizer.test('}') &&
			!tokenizer.test(T_ERR) &&
			!tokenizer.test(T_EOF) &&
			!tokenizer.next(tokenizer.EOL)) {
			SyntaxError();
		}

		return result;
	}

	function Statements(flags) {
		var statement, statements = [];
		while (!tokenizer.test(T_EOF)) {
			if (statement = Statement(flags))
				statements.push(statement);
			else break;
		}
		return statements;
	}

	function Parser(source, fName) {
		tokenizer.tokenize(source, fName);
		LABELS = {};
		var statements = Statements();
		if (!tokenizer.test(T_EOF)) SyntaxError();
		return statements;
	}

	return Parser;

});