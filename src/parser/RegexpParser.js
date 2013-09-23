define(['../Constants', 'TokenStream'], function(AST, tokenizer) {

	var Tokenizer = tokenizer.constructor;

	// used to validate regular expression flags
	var validRegexpFlags = /^(?:([gim])(?!.*\1))*$/;

	function RegexpParser() {

		if (!tokenizer.next('/')) return;

		var result = '', inCharSet = false;
		tokenizer.setContext('regexp');

		while (true) {

			if (tokenizer.test(tokenizer.EOL)) break;
			if (tokenizer.test(Tokenizer.T_EOF)) break;

			if (!inCharSet && tokenizer.test('/')) break;
			if (tokenizer.next('\\')) result += '\\';
			else if (tokenizer.test('[')) inCharSet = true;
			else if (tokenizer.test(']')) inCharSet = false;

			result += tokenizer.next().value;
		}

		if (!tokenizer.next('/')) {
			ParseError('/UNTERMINATED');
		}

		tokenizer.setContext('js');

		result = [AST.REGEXP, result];

		var flags = (
			tokenizer.next(tokenizer.ID) ||
			tokenizer.next(tokenizer.KEYWORD)
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