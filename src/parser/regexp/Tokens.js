define('../Tokens', function(jsTokens) {

	var regexpTokens = jsTokens.extend();
	regexpTokens.match('/');
	regexpTokens.match('\\');
	regexpTokens.match('(');
	regexpTokens.match(')');
	regexpTokens.match('|');
	regexpTokens.match('[');
	regexpTokens.match(']');
	regexpTokens.match('FLAGS', /[a-zA-Z]+/);
	regexpTokens.match('EOL', /\x0A\x0D/);

	return regexpTokens;

});