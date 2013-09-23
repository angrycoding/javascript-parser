define(['../Constants', 'TokenStream'], function(AST, tokenizer) {

	var Tokenizer = tokenizer.constructor;
	var T_EOF = Tokenizer.T_EOF;

	function trimLeft(value) {
		return String(value).replace(/^\s+/, '');
	}

	function parseXMLTag() {

		var tagName = tokenizer.next(tokenizer.TAG_OPEN_START);
		if (tagName) tagName = tagName.value.slice(1); else return;

		var result = [AST.XML_TAG, tagName];

		var attrs = [], attrName, attrValue;

		while (attrName = tokenizer.next(tokenizer.ATTR_NAME)) {
			if (!tokenizer.next(tokenizer.EQUALS)) ParseError('=');

			if (attrValue = tokenizer.next(tokenizer.ATTR_VALUE))
				attrs.push([
					trimLeft(attrName.value),
					attrValue.value.slice(1).slice(0, -1)
				]);
			else ParseError('ATTR_VALUE');
		}

		result.push(attrs);

		if (tokenizer.next(tokenizer.TAG_OPEN_END1)) {
			result.push(parseXMLNodes());
			var closeTag = tokenizer.next(tokenizer.TAG_CLOSE);
			if (closeTag) {
				closeTag = trimLeft(closeTag.value);
				closeTag = closeTag.slice(2).slice(0, -1);
			}
			if (!closeTag || closeTag !== tagName)
				ParseError('</' + tagName + '>');
		}

		else if (tokenizer.next(tokenizer.TAG_OPEN_END2)) {
		}

		else ParseError('ATTR_NAME', '>', '/>');

		return result;
	}

	function parseXMLText() {
		var result = '';
		for (;;) {
			if (tokenizer.test(Tokenizer.T_EOF)) break;
			if (tokenizer.test(tokenizer.TAG_OPEN_START)) break;
			if (tokenizer.test(tokenizer.TAG_CLOSE)) break;
			if (tokenizer.test('<?')) break;
			if (tokenizer.test('?>')) break;
			if (tokenizer.test('<![CDATA[')) break;
			if (tokenizer.test(']]>')) break;
			result += tokenizer.next().value;
		}
		if (result.length) return [AST.XML_TEXT, result];
	}

	function parseCDATA() {
		if (!tokenizer.next('<![CDATA[')) return;
		var result = '';
		while (!tokenizer.test([T_EOF, ']]>']))
			result += tokenizer.next().value;
		if (!tokenizer.next(']]>')) throw(']]>');
		return [AST.XML_CDATA, result];
	}




	function parseProc() {
		if (!tokenizer.next('<?')) return;
		var result = '';
		for (;;) {
			if (tokenizer.test(Tokenizer.T_EOF)) break;
			if (tokenizer.test('?>')) break;
			result += tokenizer.next().value;
		}
		if (!tokenizer.next('?>')) ParseError('?>');
		return ['PROC', result];
	}

	function parseXMLNode() {
		return (
			parseXMLTag() ||
			parseProc() ||
			parseCDATA() ||
			parseXMLText()
		);
	}

	function parseXMLNodes() {
		var result = [], node;
		while (node = parseXMLNode())
			result.push(node);
		return result;
	}

	function XMLLiteral() {
		tokenizer.setContext('xml');
		var result = (parseXMLTag() || parseCDATA());
		if (!result) ParseError('XML_TAG', 'CDATA');
		tokenizer.setContext('js');
		return result;
	}

	return XMLLiteral;

});