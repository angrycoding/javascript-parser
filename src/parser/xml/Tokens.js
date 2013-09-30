define('../Tokens', function(jsTokens) {

	var xmlTokens = jsTokens.extend();

	xmlTokens.fragment('NameStartChar', /[:A-Z_a-z\xC0-\xD6\xD8-\xF6]/);
	xmlTokens.fragment('NameStartChar', /[\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF]/);
	xmlTokens.fragment('NameStartChar', /[\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF]/);
	xmlTokens.fragment('NameStartChar', /[\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/);
	xmlTokens.fragment('NameStartChar', /[\uD800-\uDB7F][\uDC00-\uDFFF]/);
	xmlTokens.fragment('NameChar', /[:NameStartChar:]|[-.0-9\xB7\u0300-\u036F\u203F-\u2040]/);

	xmlTokens.fragment('Name', /[:NameStartChar:][:NameChar:]*/);
	xmlTokens.fragment('Spaces', /[\x09\x0A\x0D\x20]/);

	xmlTokens.match('TAG_OPEN_START', /<[:Name:]/);
	xmlTokens.match('TAG_OPEN_END1', /[:Spaces:]*>/);
	xmlTokens.match('TAG_OPEN_END2', /[:Spaces:]*\/>/);

	xmlTokens.match('<?');
	xmlTokens.match('?>');


	xmlTokens.match('<![CDATA[');
	xmlTokens.match(']]>');

	xmlTokens.match('TAG_CLOSE', /<\/[:Name:]*[:Spaces:]*>/);
	xmlTokens.match('ATTR_NAME', /[:Spaces:]+[:Name:]/);
	xmlTokens.match('EQUALS', /[:Spaces:]*=[:Spaces:]*/);
	xmlTokens.match('EOL', /[:Spaces:]+/);

	xmlTokens.match('ATTR_VALUE', /'(?:[^<\'\\]|\\.)*'/);
	xmlTokens.match('ATTR_VALUE', /"(?:[^<\"\\]|\\.)*"/);

	xmlTokens.ignore(/<!--(?:[^-]|-(?!->))*-->/);

	return xmlTokens;

});