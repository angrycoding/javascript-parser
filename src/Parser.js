define(['Tokenizer', 'Constants'], function(Tokenizer, Constants) {

	// used to validate regular expression flags
	var validRegexpFlags = /^(?:([gim])(?!.*\1))*$/;

	// used to convert control characters into regular characters
	var stringEscape = /\\(t|b|n|r|f|'|"|\\|\x[0-9A-F]{2}|\u[0-9A-F]{4})/g;

	var fileName = 'FILENAME';
	var tokenizer = new Tokenizer();

	tokenizer.addToken('@SPACES', /[\x09\x20]+/);
	tokenizer.addToken('@EOL', /[\x0A\x0D]+/);
	tokenizer.addToken('@COMMENT', /\/\/[^\x0A\x0D]*/);
	tokenizer.addToken('@COMMENT', /\/\*(?:.|[\n\r])*\*\//);

	tokenizer.addToken('>>>=');
	tokenizer.addToken('===');
	tokenizer.addToken('!==');
	tokenizer.addToken('>>>');
	tokenizer.addToken('>>=');
	tokenizer.addToken('<<=');

	tokenizer.addToken('--');
	tokenizer.addToken('++');
	tokenizer.addToken('==');
	tokenizer.addToken('-=');
	tokenizer.addToken('+=');
	tokenizer.addToken('*=');
	tokenizer.addToken('%=');
	tokenizer.addToken('/=');
	tokenizer.addToken('!=');
	tokenizer.addToken('||');
	tokenizer.addToken('&&');
	tokenizer.addToken('>>');
	tokenizer.addToken('<<');
	tokenizer.addToken('<=');
	tokenizer.addToken('>=');
	tokenizer.addToken('|=');
	tokenizer.addToken('&=');
	tokenizer.addToken('^=');

	tokenizer.addToken('-');
	tokenizer.addToken('+');
	tokenizer.addToken('*');
	tokenizer.addToken('/');
	tokenizer.addToken('%');
	tokenizer.addToken('<');
	tokenizer.addToken('>');
	tokenizer.addToken('=');
	tokenizer.addToken('|');
	tokenizer.addToken('!');
	tokenizer.addToken('~');
	tokenizer.addToken('&');
	tokenizer.addToken('^');

	tokenizer.addToken('{');
	tokenizer.addToken('}');
	tokenizer.addToken('(');
	tokenizer.addToken(')');

	tokenizer.addToken('[');
	tokenizer.addToken(']');
	tokenizer.addToken('.');
	tokenizer.addToken('?');
	tokenizer.addToken(',');
	tokenizer.addToken(':');
	tokenizer.addToken(';');

	tokenizer.addToken('KEYWORD', /new\b/, 'new');
	tokenizer.addToken('KEYWORD', /if\b/, 'if');
	tokenizer.addToken('KEYWORD', /case\b/, 'case');
	tokenizer.addToken('KEYWORD', /switch\b/, 'switch');
	tokenizer.addToken('KEYWORD', /default\b/, 'default');
	tokenizer.addToken('KEYWORD', /else\b/, 'else');
	tokenizer.addToken('KEYWORD', /do\b/, 'do');
	tokenizer.addToken('KEYWORD', /while\b/, 'while');
	tokenizer.addToken('KEYWORD', /try\b/, 'try');
	tokenizer.addToken('KEYWORD', /catch\b/, 'catch');
	tokenizer.addToken('KEYWORD', /throw\b/, 'throw');
	tokenizer.addToken('KEYWORD', /finally\b/, 'finally');
	tokenizer.addToken('KEYWORD', /for\b/, 'for');
	tokenizer.addToken('KEYWORD', /with\b/, 'with');
	tokenizer.addToken('KEYWORD', /break\b/, 'break');
	tokenizer.addToken('KEYWORD', /var\b/, 'var');
	tokenizer.addToken('KEYWORD', /continue\b/, 'continue');
	tokenizer.addToken('KEYWORD', /return\b/, 'return');
	tokenizer.addToken('KEYWORD', /function\b/, 'function');
	tokenizer.addToken('KEYWORD', /in\b/, 'in');
	tokenizer.addToken('KEYWORD', /void\b/, 'void');
	tokenizer.addToken('KEYWORD', /null\b/, 'null');
	tokenizer.addToken('KEYWORD', /this\b/, 'this');
	tokenizer.addToken('KEYWORD', /true\b/, 'true');
	tokenizer.addToken('KEYWORD', /false\b/, 'false');
	tokenizer.addToken('KEYWORD', /typeof\b/, 'typeof');
	tokenizer.addToken('KEYWORD', /delete\b/, 'delete');
	tokenizer.addToken('KEYWORD', /instanceof\b/, 'instanceof');
	tokenizer.addToken('KEYWORD', /debugger\b/, 'debugger');

	tokenizer.addToken('ID', /[a-zA-Z_$][a-zA-Z0-9_$]*/);

	tokenizer.addToken('STRING', /'(?:[^\'\\]|\\.)*'/);
	tokenizer.addToken('STRING', /"(?:[^\"\\]|\\.)*"/);
	tokenizer.addToken('HEX', /0[xX][0-9A-Fa-f]+/);
	tokenizer.addToken('DECIMAL', /(?:[0-9]*\.)?[0-9]+[eE][+-]?[0-9]+/);
	tokenizer.addToken('DECIMAL', /[0-9]*\.[0-9]+/);
	tokenizer.addToken('DECIMAL', /[0-9]+/);


	function ParseError(expected, found) {

		var found = (found || tokenizer.getFragment());
		var lineNumber = tokenizer.getLineNumber();

		var errorMessage = (
			fileName + '(' + lineNumber +
			') Syntax error, "' + expected +
			'" expected, but "' + found + '" found'
		);

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

	function UnexpectedToken() {

		var token = tokenizer.getFragment(),
			line = tokenizer.getLineNumber();

		var errorMessage = (
			fileName + '(' + line + ') ' +
			'Syntax error: unexpected token ' + token
		);

		return {
			line: line,
			token: token,
			file: fileName,
			toString: function() {
				return errorMessage;
			}
		};
	}

	function parseError(expected, found) {
		var length = arguments.length;
		if (length === 0) throw new UnexpectedToken();
		else throw new ParseError(expected, found);
	}




	function escapeString(string) {
		var string = string.slice(1, -1);
		return string.replace(stringEscape, function(str, ch) {
			switch (ch[0]) {
				// single quotation mark
				case '\'': return '\'';
				// double quotation mark
				case '\"': return '"';
				// backslash
				case '\\': return '\\';
				// backspace
				case 'b': return String.fromCharCode(8);
				// horizontal tab
				case 't': return String.fromCharCode(9);
				// new line
				case 'n': return String.fromCharCode(10);
				// form feed
				case 'f': return String.fromCharCode(12);
				// carriage return
				case 'r': return String.fromCharCode(13);
				// unicode sequence (4 hex digits: dddd)
				case 'u': return String.fromCharCode(parseInt(ch.substr(1), 16));
				// hexadecimal sequence (2 digits: dd)
				case 'x': return String.fromCharCode(parseInt(ch.substr(1), 16));
			}
		});
	}


	var SILENT_FLAG = 1 << 0;
	var NO_IN_FLAG = 1 << 1;




	function RegExpLiteral() {

		var result = '', inCharSet = false;

		while (true) {

			if (tokenizer.testChar('\x0A')) break;
			if (tokenizer.testChar('\x0D')) break;
			if (tokenizer.testChar('EOF')) break;

			if (!inCharSet && tokenizer.testChar('/')) break;

			if (tokenizer.nextChar('\\'))
				result += '\\';
			else if (tokenizer.testChar('['))
				inCharSet = true;
			else if (tokenizer.testChar(']'))
				inCharSet = false;
			result += tokenizer.nextChar();
		}

		if (!tokenizer.next('/')) {
			parseError('/UNTERMINATED');

		}

		result = [Constants.REGEXP, result];

		var flags = (
			tokenizer.next('@ID') ||
			tokenizer.next('@KEYWORD')
		);

		if (flags) {
			flags = flags.value;
			if (!validRegexpFlags.test(flags))
				parseError('INVALID:' + flags);
			result.push(flags);
		}

		return result;
	}

	function ArrayLiteral() {
		var result = [Constants.ARRAY];
		while (!tokenizer.test('@EOF')) {
			while (tokenizer.next(','))
				result.push([Constants.UNDEFINED]);
			if (tokenizer.test(']')) break;
			result.push(AssignmentExpression());
			if (tokenizer.test(']')) break;
			if (!tokenizer.next(','))
				parseError(', or ]');
		}
		if (!tokenizer.next(']')) parseError(']');
		return result;
	}

	function ObjectLiteral() {
		var key, result = [Constants.OBJECT];

		if (!tokenizer.test('}')) do {
			// @todo: escape string literal?
			// @todo: convert DECIMAL values to string?
			if (key = (
				tokenizer.next('@ID') ||
				tokenizer.next('@KEYWORD') ||
				tokenizer.next('@STRING') ||
				tokenizer.next('@DECIMAL')
			)) {
				if (!tokenizer.next(':')) parseError(':');
				result.push([String(key.value), AssignmentExpression()]);
			} else break;

		} while (tokenizer.next(','));

		if (!tokenizer.next('}')) parseError('}');
		return result;
	}


	function PrimaryExpression(flags) {

		// if (tokenizer.next('import')) return ['FUCK THAT'];

		if (tokenizer.next('null')) return [Constants.NULL];
		if (tokenizer.next('this')) return [Constants.THIS];
		if (tokenizer.next('true')) return [Constants.TRUE];
		if (tokenizer.next('false')) return [Constants.FALSE];

		if (tokenizer.test('@ID'))
			return [Constants.NAME, tokenizer.next().value];

		if (tokenizer.test('@DECIMAL'))
			return [Constants.NUMBER, parseFloat(tokenizer.next().value)];

		if (tokenizer.test('@HEX'))
			return [Constants.NUMBER, parseInt(tokenizer.next().value, 16)];

		if (tokenizer.test('@STRING'))
			return [Constants.STRING, escapeString(tokenizer.next().value)];

		if (tokenizer.next('(')) {
			var expression = Expression();
			if (!tokenizer.next(')'))
				parseError(')');
			return [Constants.PARENS, expression];
		}

		if (tokenizer.next('/')) return RegExpLiteral();
		if (tokenizer.next('[')) return ArrayLiteral();
		if (tokenizer.next('{')) return ObjectLiteral();

		if (tokenizer.next('function')) {
			var args = [], name = tokenizer.next('@ID');
			name = (name ? name.value : null);
			if (!tokenizer.next('(')) parseError('(');
			if (!tokenizer.test(')')) do {
				var arg = tokenizer.next('@ID');
				if (!arg) parseError('Identifier');
				args.push(arg.value);
			} while (tokenizer.next(','));
			if (!tokenizer.next(')')) parseError(')');
			return [Constants.FUNCTION, name, args, Block(true)];
		}

		if (!(flags & SILENT_FLAG)) parseError('EXPRESSION');
	}

	function AllocationExpression(flags) {
		if (tokenizer.next('new')) {
			return [Constants.NEW, CallExpression()];
		} else return PrimaryExpression(flags);
	}

	function CallExpression(flags) {

		var left = AllocationExpression(flags);

		if (left) while (true) {

			if (tokenizer.next('.')) {
				if (!tokenizer.test('@ID') &&
					!tokenizer.test('@KEYWORD')) {
					parseError('identifier');
				}
				if (left[0] !== Constants.SELECTOR)
					left = [Constants.SELECTOR, [left]];
				left[1].push(['ID', tokenizer.next().value]);
			}

			else if (tokenizer.next('[')) {
				if (tokenizer.next(']'))
					parseError('expression', '[]');
				if (left[0] !== Constants.SELECTOR)
					left = [Constants.SELECTOR, [left]];
				left[1].push(Expression());
				if (!tokenizer.next(']'))
					parseError(']');
			}

			else if (tokenizer.next('(')) {
				left = [Constants.CALL, left, []];
				if (!tokenizer.test(')')) do {
					var expression = AssignmentExpression();
					if (!expression) parseError('expression');
					left[2].push(expression);
				} while (tokenizer.next(','));
				if (!tokenizer.next(')'))
					parseError(')');
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
			[Constants.INC, expression] ||
			tokenizer.next('--') &&
			[Constants.DEC, expression] ||
			expression
		);
	}

	// precedence 4
	function UnaryExpression(flags) {
		if (tokenizer.next('delete'))
			return [Constants.DELETE, UnaryExpression()];
		else if (tokenizer.next('void'))
			return [Constants.VOID, UnaryExpression()];
		else if (tokenizer.next('typeof'))
			return [Constants.TYPEOF, UnaryExpression()];
		else if (tokenizer.next('++'))
			return [Constants.UINC, UnaryExpression()];
		else if (tokenizer.next('--'))
			return [Constants.UDEC, UnaryExpression()];
		else if (tokenizer.next('+'))
			return [Constants.UADD, UnaryExpression()];
		else if (tokenizer.next('-'))
			return [Constants.USUB, UnaryExpression()];
		else if (tokenizer.next('~'))
			return [Constants.BIT_NOT, UnaryExpression()];
		else if (tokenizer.next('!'))
			return [Constants.NOT, UnaryExpression()];
		else return PostfixExpression(flags);
	}

	// precedence 5
	function MultiplicativeExpression(flags) {
		var left = UnaryExpression(flags);
		if (left) while (
			tokenizer.next('*') &&
			(left = [Constants.MUL, left, UnaryExpression()]) ||
			tokenizer.next('/') &&
			(left = [Constants.DIV, left, UnaryExpression()]) ||
			tokenizer.next('%') &&
			(left = [Constants.MOD, left, UnaryExpression()])
		);
		return left;
	}

	// precedence 6
	function AdditiveExpression(flags) {
		var left = MultiplicativeExpression(flags);
		if (left) while (
			tokenizer.next('+') &&
			(left = [Constants.ADD, left, MultiplicativeExpression()]) ||
			tokenizer.next('-') &&
			(left = [Constants.SUB, left, MultiplicativeExpression()])
		);
		return left;
	}

	// precedence 7
	function ShiftExpression(flags) {
		var left = AdditiveExpression(flags);
		if (left) while (
			tokenizer.next('<<') &&
			(left = [Constants.BIT_SHL, left, AdditiveExpression()]) ||
			tokenizer.next('>>') &&
			(left = [Constants.BIT_SHR, left, AdditiveExpression()]) ||
			tokenizer.next('>>>') &&
			(left = [Constants.BIT_SHRZ, left, AdditiveExpression()])
		);
		return left;
	}

	// precedence 8
	function RelationalExpression(flags) {
		var left = ShiftExpression(flags &~ NO_IN_FLAG);
		if (flags &= NO_IN_FLAG, flags = !flags, left) while (
			(flags && tokenizer.next('in')) &&
			(left = [Constants.IN, left, ShiftExpression()]) ||
			tokenizer.next('instanceof') &&
			(left = [Constants.INSTANCEOF, left, ShiftExpression()]) ||
			tokenizer.next('<') &&
			(left = [Constants.LESS_THAN, left, ShiftExpression()]) ||
			tokenizer.next('>') &&
			(left = [Constants.GREATER_THAN, left, ShiftExpression()]) ||
			tokenizer.next('<=') &&
			(left = [Constants.LESS_OR_EQUAL, left, ShiftExpression()]) ||
			tokenizer.next('>=') &&
			(left = [Constants.GREATER_OR_EQUAL, left, ShiftExpression()])
		);
		return left;
	}

	// precedence 9
	function EqualityExpression(flags) {
		var left = RelationalExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('==') &&
			(left = [Constants.EQUAL, left, RelationalExpression(flags)]) ||
			tokenizer.next('===') &&
			(left = [Constants.STRICT_EQUAL, left, RelationalExpression(flags)]) ||
			tokenizer.next('!=') &&
			(left = [Constants.NOT_EQUAL, left, RelationalExpression(flags)]) ||
			tokenizer.next('!==') &&
			(left = [Constants.STRICT_NOT_EQUAL, left, RelationalExpression(flags)])
		);
		return left;
	}

	// precedence 10
	function BitwiseANDExpression(flags) {
		var left = EqualityExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('&') &&
			(left = [Constants.BIT_AND, left, EqualityExpression(flags)])
		);
		return left;
	}

	// precedence 11
	function BitwiseXORExpression(flags) {
		var left = BitwiseANDExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('^') &&
			(left = [Constants.BIT_XOR, left, BitwiseANDExpression(flags)])
		);
		return left;
	}

	// precedence 12
	function BitwiseORExpression(flags) {
		var left = BitwiseXORExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('|') &&
			(left = [Constants.BIT_OR, left, BitwiseXORExpression(flags)])
		);
		return left;
	}

	// precedence 13
	function LogicalANDExpression(flags) {
		var left = BitwiseORExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('&&') &&
			(left = [Constants.AND, left, BitwiseORExpression(flags)])
		);
		return left;
	}

	// precedence 14
	function LogicalORExpression(flags) {
		var left = LogicalANDExpression(flags);
		if (flags &= ~SILENT_FLAG, left) while (
			tokenizer.next('||') &&
			(left = [Constants.OR, left, LogicalANDExpression(flags)])
		);
		return left;
	}

	// precedence 15
	function ConditionalExpression(flags) {
		var expression = LogicalORExpression(flags);
		if (expression && tokenizer.next('?')) {
			expression = [Constants.TERNARY, expression];
			expression.push(AssignmentExpression());
			if (!tokenizer.next(':')) parseError(':');
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
			[Constants.ASSIGN, expression, AssignmentExpression(flags)] ||
			tokenizer.next('*=') &&
			[Constants.ASSIGN_MUL, expression, AssignmentExpression(flags)] ||
			tokenizer.next('/=') &&
			[Constants.ASSIGN_DIV, expression, AssignmentExpression(flags)] ||
			tokenizer.next('%=') &&
			[Constants.ASSIGN_MOD, expression, AssignmentExpression(flags)] ||
			tokenizer.next('+=') &&
			[Constants.ASSIGN_ADD, expression, AssignmentExpression(flags)] ||
			tokenizer.next('-=') &&
			[Constants.ASSIGN_SUB, expression, AssignmentExpression(flags)] ||
			tokenizer.next('<<=') &&
			[Constants.ASSIGN_BIT_SHL, expression, AssignmentExpression(flags)] ||
			tokenizer.next('>>=') &&
			[Constants.ASSIGN_BIT_SHR, expression, AssignmentExpression(flags)] ||
			tokenizer.next('>>>=') &&
			[Constants.ASSIGN_BIT_SHRZ, expression, AssignmentExpression(flags)] ||
			tokenizer.next('&=') &&
			[Constants.ASSIGN_BIT_AND, expression, AssignmentExpression(flags)] ||
			tokenizer.next('^=') &&
			[Constants.ASSIGN_BIT_XOR, expression, AssignmentExpression(flags)] ||
			tokenizer.next('|=') &&
			[Constants.ASSIGN_BIT_OR, expression, AssignmentExpression(flags)] ||
			expression
		);
	}

	// precedence 18
	function Expression(flags) {
		var expression = AssignmentExpression(flags);
		if (expression && tokenizer.next(',')) {
			flags &= ~SILENT_FLAG;
			expression = [Constants.MULTIPLE, expression];
			do { expression.push(AssignmentExpression(flags)); }
			while (tokenizer.next(','));
		}
		return expression;
	}


	function BracketExpression() {
		if (!tokenizer.next('('))
			parseError('(');
		var expression = Expression();
		if (!tokenizer.next(')'))
			parseError(')');
		return expression;
	}


	// simplify
	function DoStatement() {
		if (tokenizer.next('do')) return [
			Constants.DO_LOOP, Statement(true), (
				tokenizer.next('while') &&
				BracketExpression()
			) || parseError('while')
		];
	}

	// completed
	function WithStatement() {
		if (tokenizer.next('with')) return [
			Constants.WITH,
			BracketExpression(),
			Statement(true)
		];
	}

	// completed
	function WhileStatement() {
		if (tokenizer.next('while')) return [
			Constants.WHILE_LOOP,
			BracketExpression(),
			Statement(true)
		];
	}

	// completed
	function IfStatement() {
		if (tokenizer.next('if')) {
			var result = [Constants.IF, BracketExpression()];
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
			if (!tokenizer.next('('))
				parseError('(');
			var varName = tokenizer.next('@ID');
			if (!varName) parseError('identifier');
			result.push(varName.value);
			if (!tokenizer.next(')'))
				parseError(')');
			result.push(Block(true));
		}
		if (tokenizer.next('finally'))
			result.push(Block(true));
		if (result.length < 2)
			parseError('catch or finally');
		return [Constants.TRY, result];
	}


	// simplify!!!!
	function ForStatement() {
		if (!tokenizer.next('for')) return;
		if (!tokenizer.next('(')) parseError('(');

		var result = (
			tokenizer.test('var') ?
			VariableStatement(NO_IN_FLAG) :
			Expression(NO_IN_FLAG)
		);

		if (tokenizer.next(';')) {
			result = [Constants.FOR_LOOP, result];
			result.push(Expression(SILENT_FLAG));
			if (!tokenizer.next(';'))
				parseError(';');
			result.push(Expression(SILENT_FLAG));
		}

		else if (tokenizer.test('in')) {

			if (result[0] === Constants.VAR && result.length > 2) {
				parseError(';');
			} else tokenizer.next();


			result = [Constants.FOR_IN_LOOP, result];
			result.push(Expression());
		}

		if (!tokenizer.next(')')) parseError(')');
		result.push(Statement(true));
		return result;

	}

	// simplify, check for case, continue, break new lines & labels
	function SwitchStatement() {
		if (!tokenizer.next('switch')) return;
		var expression = BracketExpression();
		var caseStatements = [], defaultStatements;
		if (!tokenizer.next('{')) parseError('{');
		if (!tokenizer.test('}')) do {

			if (tokenizer.next('case')) {
				var condition = Expression();
				if (!tokenizer.next(':')) parseError(':');
				caseStatements.push([condition, Statements()])
			} else if (tokenizer.next('default')) {
				if (!tokenizer.next(':')) parseError(':');
				if (defaultStatements) parseError('more than one default');
				defaultStatements = Statements();
			} else break;

		} while (!tokenizer.test('@EOF'));

		if (!tokenizer.next('}')) parseError('}');

		return [Constants.SWITCH, expression, caseStatements, defaultStatements];
	}




	function Block(required) {

		// save current position

		if (tokenizer.next('{')) {

			var statements = Statements();
			if (!tokenizer.next('}'))
				parseError('}');
			return [Constants.BLOCK, statements];

		} else if (required) parseError('{...}');
	}



	function VariableStatement(flags) {
		if (tokenizer.next('var')) {
			var variable, variables = [Constants.VAR];
			do {
				variable = tokenizer.next('@ID');
				if (!variable) parseError('identifier');
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
			if (tokenizer.next('@EOL'))
				parseError('Illegal newline after throw');
			return [Constants.THROW, Expression()];
		}
	}

	// completed: simplify & check for new lines bugs
	function ReturnStatement() {
		if (tokenizer.next('return')) {
			var result = [Constants.RETURN];
			var expression = Expression(SILENT_FLAG);
			if (expression) result.push(expression);
			return result;
		}
	}

	// completed: simplify & check for new lines bugs
	function BreakStatement() {
		if (tokenizer.next('break')) {
			var label = tokenizer.next('@ID');
			if (!label) return [Constants.BREAK];
			return [Constants.BREAK, label.value];
		}
	}

	// completed: simplify & check for new lines bugs
	function ContinueStatement() {
		if (tokenizer.next('continue')) {
			var label = tokenizer.next('@ID');
			if (!label) return [Constants.CONTINUE];
			return [Constants.CONTINUE, label.value];
		}
	}

	function LabelledStatement() {
		if (tokenizer.test('@ID', ':')) return [
			Constants.LABELLED,
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

		else if (required) parseError('STATEMENT');


		if (!tokenizer.next(';') &&
			!tokenizer.test('@ERR') &&
			!tokenizer.test('@EOF') &&
			!tokenizer.test('}') &&
			!tokenizer.next('@EOL')) {
			parseError(';');
		}

		return result;
	}

	function Statements() {
		var statement, statements = [];
		while (!tokenizer.test('@EOF')) {
			if (statement = Statement()) {
				statements.push(statement);
			} else break;
		}
		return statements;
	}

	function Parser(source, name) {
		tokenizer.tokenize(source);
		var statements = Statements();
		if (!tokenizer.test('@EOF'))
			parseError();
		return statements;
	}

	return Parser;

});