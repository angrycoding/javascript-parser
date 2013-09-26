define(['../Constants', 'Tokens'], function(AST, Tokens) {

	// used to validate regular expression flags
	var validRegexpFlags = /^(?:([gim])(?!.*\1))*$/;

	function RegexpParser() {

		if (!Tokens.next('/')) return;

		var result = '', inCharSet = false;
		Tokens.setContext('regexp');

		while (true) {

			if (Tokens.test(Tokens.EOL)) break;
			if (Tokens.test(Tokens.$EOF)) break;

			if (!inCharSet && Tokens.test('/')) break;
			if (Tokens.next('\\')) result += '\\';
			else if (Tokens.test('[')) inCharSet = true;
			else if (Tokens.test(']')) inCharSet = false;

			result += Tokens.next().value;
		}

		if (!Tokens.next('/')) {
			ParseError('/UNTERMINATED');
		}

		Tokens.setContext('js');

		result = [AST.REGEXP, result];

		var flags = (
			Tokens.next(Tokens.ID) ||
			Tokens.next(Tokens.KEYWORD)
		);

		if (flags) {
			flags = flags.value;
			if (!validRegexpFlags.test(flags))
				ParseError('INVALID:' + flags);
			result.push(flags);
		}

		return result;
	}

	return RegexpParser;

});