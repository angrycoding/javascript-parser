define(['../Constants', 'Tokens'], function(AST, Tokens) {

	function trimLeft(value) {
		return String(value).replace(/^\s+/, '');
	}

	function parseXMLTag() {

		var tagName = Tokens.next(Tokens.TAG_OPEN_START);
		if (tagName) tagName = tagName.value.slice(1); else return;

		var result = [AST.XML_TAG, tagName];

		var attrs = [], attrName, attrValue;

		while (attrName = Tokens.next(Tokens.ATTR_NAME)) {
			if (!Tokens.next(Tokens.EQUALS)) ParseError('=');

			if (attrValue = Tokens.next(Tokens.ATTR_VALUE))
				attrs.push([
					trimLeft(attrName.value),
					attrValue.value.slice(1).slice(0, -1)
				]);
			else ParseError('ATTR_VALUE');
		}

		result.push(attrs);

		if (Tokens.next(Tokens.TAG_OPEN_END1)) {
			result.push(parseXMLNodes());
			var closeTag = Tokens.next(Tokens.TAG_CLOSE);
			if (closeTag) {
				closeTag = trimLeft(closeTag.value);
				closeTag = closeTag.slice(2).slice(0, -1);
			}
			if (!closeTag || closeTag !== tagName)
				ParseError('</' + tagName + '>');
		}

		else if (Tokens.next(Tokens.TAG_OPEN_END2)) {
		}

		else ParseError('ATTR_NAME', '>', '/>');

		return result;
	}

	function parseXMLText() {
		var result = '';
		for (;;) {
			if (Tokens.test(Tokens.$EOF)) break;
			if (Tokens.test(Tokens.TAG_OPEN_START)) break;
			if (Tokens.test(Tokens.TAG_CLOSE)) break;
			if (Tokens.test('<?')) break;
			if (Tokens.test('?>')) break;
			if (Tokens.test('<![CDATA[')) break;
			if (Tokens.test(']]>')) break;
			result += Tokens.next().value;
		}
		if (result.length) return [AST.XML_TEXT, result];
	}

	function parseCDATA() {
		if (!Tokens.next('<![CDATA[')) return;
		var result = '';
		while (!Tokens.test([Tokens.$EOF, ']]>']))
			result += Tokens.next().value;
		if (!Tokens.next(']]>')) throw(']]>');
		return [AST.XML_CDATA, result];
	}




	function parseProc() {
		if (!Tokens.next('<?')) return;
		var result = '';
		for (;;) {
			if (Tokens.test(Tokens.$EOF)) break;
			if (Tokens.test('?>')) break;
			result += Tokens.next().value;
		}
		if (!Tokens.next('?>')) ParseError('?>');
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
		Tokens.setContext('xml');
		var result = (parseXMLTag() || parseCDATA());
		if (!result) ParseError('XML_TAG', 'CDATA');
		Tokens.setContext('js');
		return result;
	}

	return XMLLiteral;

});