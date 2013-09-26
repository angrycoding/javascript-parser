define('Tokenizer', function(Tokenizer) {

	var Tokens = new Tokenizer();

	var jsContext = Tokens.context('js');

	jsContext.match('KEYWORD', /in\b/, 'in');
	jsContext.match('KEYWORD', /if\b/, 'if');
	jsContext.match('KEYWORD', /do\b/, 'do');
	jsContext.match('KEYWORD', /new\b/, 'new');
	jsContext.match('KEYWORD', /for\b/, 'for');
	jsContext.match('KEYWORD', /try\b/, 'try');
	jsContext.match('KEYWORD', /var\b/, 'var');
	jsContext.match('KEYWORD', /case\b/, 'case');
	jsContext.match('KEYWORD', /else\b/, 'else');
	jsContext.match('KEYWORD', /with\b/, 'with');
	jsContext.match('KEYWORD', /void\b/, 'void');
	jsContext.match('KEYWORD', /null\b/, 'null');
	jsContext.match('KEYWORD', /this\b/, 'this');
	jsContext.match('KEYWORD', /true\b/, 'true');
	jsContext.match('KEYWORD', /false\b/, 'false');
	jsContext.match('KEYWORD', /throw\b/, 'throw');
	jsContext.match('KEYWORD', /catch\b/, 'catch');
	jsContext.match('KEYWORD', /while\b/, 'while');
	jsContext.match('KEYWORD', /break\b/, 'break');
	jsContext.match('KEYWORD', /typeof\b/, 'typeof');
	jsContext.match('KEYWORD', /switch\b/, 'switch');
	jsContext.match('KEYWORD', /return\b/, 'return');
	jsContext.match('KEYWORD', /delete\b/, 'delete');
	jsContext.match('KEYWORD', /default\b/, 'default');
	jsContext.match('KEYWORD', /finally\b/, 'finally');
	jsContext.match('KEYWORD', /continue\b/, 'continue');
	jsContext.match('KEYWORD', /function\b/, 'function');
	jsContext.match('KEYWORD', /debugger\b/, 'debugger');
	jsContext.match('KEYWORD', /instanceof\b/, 'instanceof');

	jsContext.match('STRING', /'(?:[^\n\'\\]|\\[^ux]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})*'/);
	jsContext.match('STRING', /"(?:[^\n\"\\]|\\[^ux]|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})*"/);
	jsContext.match('HEX', /0[xX][0-9A-Fa-f]+/);
	jsContext.match('DECIMAL', /(?:[0-9]*\.)?[0-9]+[eE][+-]?[0-9]+/);
	jsContext.match('DECIMAL', /[0-9]*\.[0-9]+/);
	jsContext.match('DECIMAL', /[0-9]+/);
	jsContext.match('ID', /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*/);

	jsContext.ignore(/[\x09\x20]+/);
	jsContext.ignore(/\/\/[^\x0A\x0D]*/);
	jsContext.ignore(/\/\*(?:.|[\n\r])*\*\//);
	jsContext.ignore('EOL', /[\x0A\x0D]+/);

	jsContext.match('>>>=');
	jsContext.match('===');
	jsContext.match('!==');
	jsContext.match('>>>');
	jsContext.match('>>=');
	jsContext.match('<<=');

	jsContext.match('--');
	jsContext.match('++');
	jsContext.match('==');
	jsContext.match('-=');
	jsContext.match('+=');
	jsContext.match('*=');
	jsContext.match('%=');
	jsContext.match('/=');
	jsContext.match('!=');
	jsContext.match('||');
	jsContext.match('&&');
	jsContext.match('>>');
	jsContext.match('<<');
	jsContext.match('<=');
	jsContext.match('>=');
	jsContext.match('|=');
	jsContext.match('&=');
	jsContext.match('^=');

	jsContext.match('-');
	jsContext.match('+');
	jsContext.match('*');
	jsContext.match('/');
	jsContext.match('%');
	jsContext.match('<');
	jsContext.match('>');
	jsContext.match('=');
	jsContext.match('|');
	jsContext.match('!');
	jsContext.match('~');
	jsContext.match('&');
	jsContext.match('^');

	jsContext.match('{');
	jsContext.match('}');
	jsContext.match('(');
	jsContext.match(')');

	jsContext.match('[');
	jsContext.match(']');
	jsContext.match('.');
	jsContext.match('?');
	jsContext.match(',');
	jsContext.match(':');
	jsContext.match(';');


	var reContext = Tokens.context('regexp');
	reContext.match('/');
	reContext.match('\\');
	reContext.match('(');
	reContext.match(')');
	reContext.match('|');
	reContext.match('[');
	reContext.match(']');
	reContext.match('EOL', /\x0A\x0D/);

	var xmlContext = Tokens.context('xml');

	xmlContext.match('TAG_OPEN_START', /<[_:A-Za-z][-._:A-Za-z0-9]*/);
	xmlContext.match('TAG_OPEN_END1', /[\x09\x0A\x0D\x20]*>/);
	xmlContext.match('TAG_OPEN_END2', /[\x09\x0A\x0D\x20]*\/>/);

	xmlContext.match('<?');
	xmlContext.match('?>');

	xmlContext.match('<![CDATA[');
	xmlContext.match(']]>');

	xmlContext.match('TAG_CLOSE', /<\/[_:A-Za-z][-._:A-Za-z0-9]*[\x09\x0A\x0D\x20]*>/);
	xmlContext.match('ATTR_NAME', /[\x09\x0A\x0D\x20]+[_:A-Za-z][-._:A-Za-z0-9]*/);
	xmlContext.match('EQUALS', /[\x09\x0A\x0D\x20]*=[\x09\x0A\x0D\x20]*/);

	xmlContext.match('ATTR_VALUE', /'(?:[^<\'\\]|\\.)*'/);
	xmlContext.match('ATTR_VALUE', /"(?:[^<\"\\]|\\.)*"/);

	xmlContext.ignore(/<!--(?:[^-]|-(?!->))*-->/);

	return Tokens;

});