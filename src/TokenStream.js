define('Tokenizer', function(Tokenizer) {

	var tokenStream = new Tokenizer();

	tokenStream.match('KEYWORD', /in\b/, 'in');
	tokenStream.match('KEYWORD', /if\b/, 'if');
	tokenStream.match('KEYWORD', /do\b/, 'do');
	tokenStream.match('KEYWORD', /new\b/, 'new');
	tokenStream.match('KEYWORD', /for\b/, 'for');
	tokenStream.match('KEYWORD', /try\b/, 'try');
	tokenStream.match('KEYWORD', /var\b/, 'var');
	tokenStream.match('KEYWORD', /case\b/, 'case');
	tokenStream.match('KEYWORD', /else\b/, 'else');
	tokenStream.match('KEYWORD', /with\b/, 'with');
	tokenStream.match('KEYWORD', /void\b/, 'void');
	tokenStream.match('KEYWORD', /null\b/, 'null');
	tokenStream.match('KEYWORD', /this\b/, 'this');
	tokenStream.match('KEYWORD', /true\b/, 'true');
	tokenStream.match('KEYWORD', /false\b/, 'false');
	tokenStream.match('KEYWORD', /throw\b/, 'throw');
	tokenStream.match('KEYWORD', /catch\b/, 'catch');
	tokenStream.match('KEYWORD', /while\b/, 'while');
	tokenStream.match('KEYWORD', /break\b/, 'break');
	tokenStream.match('KEYWORD', /typeof\b/, 'typeof');
	tokenStream.match('KEYWORD', /switch\b/, 'switch');
	tokenStream.match('KEYWORD', /return\b/, 'return');
	tokenStream.match('KEYWORD', /delete\b/, 'delete');
	tokenStream.match('KEYWORD', /default\b/, 'default');
	tokenStream.match('KEYWORD', /finally\b/, 'finally');
	tokenStream.match('KEYWORD', /continue\b/, 'continue');
	tokenStream.match('KEYWORD', /function\b/, 'function');
	tokenStream.match('KEYWORD', /debugger\b/, 'debugger');
	tokenStream.match('KEYWORD', /instanceof\b/, 'instanceof');

	tokenStream.match('STRING', /'(?:[^\'\\]|\\.)*'/);
	tokenStream.match('STRING', /"(?:[^\"\\]|\\.)*"/);
	tokenStream.match('HEX', /0[xX][0-9A-Fa-f]+/);
	tokenStream.match('DECIMAL', /(?:[0-9]*\.)?[0-9]+[eE][+-]?[0-9]+/);
	tokenStream.match('DECIMAL', /[0-9]*\.[0-9]+/);
	tokenStream.match('DECIMAL', /[0-9]+/);
	tokenStream.match('ID', /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*/);

	tokenStream.ignore(/[\x09\x20]+/);
	tokenStream.ignore(/\/\/[^\x0A\x0D]*/);
	tokenStream.ignore(/\/\*(?:.|[\n\r])*\*\//);
	tokenStream.ignore('EOL', /[\x0A\x0D]+/);

	tokenStream.match('>>>=');
	tokenStream.match('===');
	tokenStream.match('!==');
	tokenStream.match('>>>');
	tokenStream.match('>>=');
	tokenStream.match('<<=');

	tokenStream.match('--');
	tokenStream.match('++');
	tokenStream.match('==');
	tokenStream.match('-=');
	tokenStream.match('+=');
	tokenStream.match('*=');
	tokenStream.match('%=');
	tokenStream.match('/=');
	tokenStream.match('!=');
	tokenStream.match('||');
	tokenStream.match('&&');
	tokenStream.match('>>');
	tokenStream.match('<<');
	tokenStream.match('<=');
	tokenStream.match('>=');
	tokenStream.match('|=');
	tokenStream.match('&=');
	tokenStream.match('^=');

	tokenStream.match('-');
	tokenStream.match('+');
	tokenStream.match('*');
	tokenStream.match('/');
	tokenStream.match('%');
	tokenStream.match('<');
	tokenStream.match('>');
	tokenStream.match('=');
	tokenStream.match('|');
	tokenStream.match('!');
	tokenStream.match('~');
	tokenStream.match('&');
	tokenStream.match('^');

	tokenStream.match('{');
	tokenStream.match('}');
	tokenStream.match('(');
	tokenStream.match(')');

	tokenStream.match('[');
	tokenStream.match(']');
	tokenStream.match('.');
	tokenStream.match('?');
	tokenStream.match(',');
	tokenStream.match(':');
	tokenStream.match(';');

	return tokenStream;

});