define('../Tokenizer', function(Tokenizer) {

	var jsTokens = new Tokenizer();

	jsTokens.match('KEYWORD', /in\b/);
	jsTokens.match('KEYWORD', /if\b/);
	jsTokens.match('KEYWORD', /do\b/);
	jsTokens.match('KEYWORD', /new\b/);
	jsTokens.match('KEYWORD', /for\b/);
	jsTokens.match('KEYWORD', /try\b/);
	jsTokens.match('KEYWORD', /var\b/);
	jsTokens.match('KEYWORD', /case\b/);
	jsTokens.match('KEYWORD', /else\b/);
	jsTokens.match('KEYWORD', /with\b/);
	jsTokens.match('KEYWORD', /void\b/);
	jsTokens.match('KEYWORD', /null\b/);
	jsTokens.match('KEYWORD', /this\b/);
	jsTokens.match('KEYWORD', /true\b/);
	jsTokens.match('KEYWORD', /false\b/);
	jsTokens.match('KEYWORD', /throw\b/);
	jsTokens.match('KEYWORD', /catch\b/);
	jsTokens.match('KEYWORD', /while\b/);
	jsTokens.match('KEYWORD', /break\b/);
	jsTokens.match('KEYWORD', /typeof\b/);
	jsTokens.match('KEYWORD', /switch\b/);
	jsTokens.match('KEYWORD', /return\b/);
	jsTokens.match('KEYWORD', /delete\b/);
	jsTokens.match('KEYWORD', /default\b/);
	jsTokens.match('KEYWORD', /finally\b/);
	jsTokens.match('KEYWORD', /continue\b/);
	jsTokens.match('KEYWORD', /function\b/);
	jsTokens.match('KEYWORD', /debugger\b/);
	jsTokens.match('KEYWORD', /instanceof\b/);
	jsTokens.match('REQUIRE', /#require\b/);

	jsTokens.match('STRING', /'(?:[^\n\'\\]|\\[^ux]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})*'/);
	jsTokens.match('STRING', /"(?:[^\n\"\\]|\\[^ux]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})*"/);

	jsTokens.match('HEX', /0[xX][0-9A-Fa-f]+/);
	jsTokens.match('DECIMAL', /(?:[0-9]*\.)?[0-9]+[eE][+-]?[0-9]+/);
	jsTokens.match('DECIMAL', /[0-9]*\.[0-9]+/);
	jsTokens.match('DECIMAL', /[0-9]+/);
	jsTokens.match('ID', /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*/);

	jsTokens.ignore(/[\x09\x20]+/);
	jsTokens.ignore(/\/\/[^\x0A\x0D]*/);
	jsTokens.ignore(/\/\*(?:.|[\n\r])*\*\//);
	jsTokens.ignore('EOL', /[\x0A\x0D]+/);

	jsTokens.match('>>>=');
	jsTokens.match('===');
	jsTokens.match('!==');
	jsTokens.match('>>>');
	jsTokens.match('>>=');
	jsTokens.match('<<=');

	jsTokens.match('--');
	jsTokens.match('++');
	jsTokens.match('==');
	jsTokens.match('-=');
	jsTokens.match('+=');
	jsTokens.match('*=');
	jsTokens.match('%=');
	jsTokens.match('/=');
	jsTokens.match('!=');
	jsTokens.match('||');
	jsTokens.match('&&');
	jsTokens.match('>>');
	jsTokens.match('<<');
	jsTokens.match('<=');
	jsTokens.match('>=');
	jsTokens.match('|=');
	jsTokens.match('&=');
	jsTokens.match('^=');

	jsTokens.match('-');
	jsTokens.match('+');
	jsTokens.match('*');
	jsTokens.match('/');
	jsTokens.match('%');
	jsTokens.match('<');
	jsTokens.match('>');
	jsTokens.match('=');
	jsTokens.match('|');
	jsTokens.match('!');
	jsTokens.match('~');
	jsTokens.match('&');
	jsTokens.match('^');

	jsTokens.match('{');
	jsTokens.match('}');
	jsTokens.match('(');
	jsTokens.match(')');

	jsTokens.match('[');
	jsTokens.match(']');
	jsTokens.match('.');
	jsTokens.match('?');
	jsTokens.match(',');
	jsTokens.match(':');
	jsTokens.match(';');


	return jsTokens;

});