define(function() {

	function escapeRegExp(value) {
		return value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	}

	function isString(value) {
		return (typeof value === 'string');
	}

	function isRegExp(value) {
		return (value instanceof RegExp);
	}

	function Tokenizer() {

		var tokenBuffer = [];
		var tokenDefinitions = [[]];
		var inputString, inputStringLength;

		function readTokens() {
			var regexp = tokenDefinitions[0],
				textData, data, start, length, index;
			while (true) if (regexp.lastIndex !== inputStringLength) {
				start = regexp.lastIndex;
				if (data = regexp.exec(inputString)) {
					index = data.index;
					if (length = index - start) {
						tokenBuffer.push({
							ignore: false,
							type: 'ERR',
							pos: start,
							value: inputString.substr(start, length)
						});
					}
					length = data.length;
					while (--length > 0) if (textData = data[length]) {
						data = tokenDefinitions[length];
						tokenBuffer.push({
							ignore: data[0],
							type: data[1],
							attr: data[2],
							pos: index,
							value: textData
						});
						if (data[0]) break; else return;
					}
				} else return (
					regexp.lastIndex = inputStringLength,
					length = inputStringLength - start &&
					tokenBuffer.push({
						ignore: false,
						type: 'ERR',
						pos: start,
						value: inputString.substr(start, length)
					})
				);
			} else return tokenBuffer.push({
				ignore: false,
				type: 'EOF',
				pos: inputStringLength
			});
		}

		function readCharacter(move) {

			var pos = (
				tokenBuffer.length ?
				tokenBuffer[0].pos :
				tokenDefinitions[0].lastIndex
			);

			var ch = (
				pos === inputStringLength ?
				'EOF' : inputString[pos]
			);

			if (arguments.length > 1 && arguments[1] !== ch) {
				return;
			}

			if (move && pos < inputStringLength) {
				tokenBuffer = [];
				tokenDefinitions[0].lastIndex =
				pos + 1;
			}

			return ch;
		}


		this.addToken = function(tokenName, expression, attr) {

			// if (!isString(tokenName)) return;
			// tokenName to uppercase?

			if (!arguments.length) return;

			if (arguments.length === 1) {
				expression = tokenName;
				tokenName = tokenName;
			}

			if (isRegExp(expression)) {
				expression = expression.toString();
				expression = expression.slice(1, -1);
			} else expression = escapeRegExp(expression);


			// if (!isString(expression)) return;

			var ignore = false;

			if (tokenName[0] === '@') {
				ignore = true;
				tokenName = tokenName.substr(1);
			}

			tokenDefinitions[0].push('(' + expression + ')');
			tokenDefinitions.push([ignore, tokenName, attr]);

		};



		this.tokenize = function(input) {
			tokenBuffer = [];
			inputString = input;
			inputStringLength = input.length;
			tokenDefinitions[0] = new RegExp(
				tokenDefinitions[0].join('|'), 'g'
			);
		};

		function test(token, props) {
			for (var key in props) {
				if (token[key] !== props[key]) {
					return false;
				}
			}
			return true;
		}

		function readUntil(props, remove) {

			if (!tokenBuffer.length) readTokens();

			for (var c = 0; c < tokenBuffer.length; c++) {

				var token = tokenBuffer[c];

				if (!test(token, props)) {
					if (token.ignore) continue;
					return;
				}

				else {
					if (remove)
						tokenBuffer.splice(0, c + 1);
					return token;
				}

			}
		}


		this.getFragment = function() {
			return readUntil({ignore: false}, false).value;
		};

		this.getLineNumber = function() {
			var code, start = -1, lineNumber = 1,
				end = readUntil({ignore: false}, false).pos;
			while (++start < end) {
				code = inputString.charCodeAt(start);
				if (code === 10 || code === 13) lineNumber++;
			}
			return lineNumber;
		};

		this.test = function(type, attr) {
			// console.info('test', type);
			var length = arguments.length;
			return !!readUntil(
				length > 1 ? {type: type, attr: attr} :
				length > 0 ? {type: type} :
				{ignore: false},
				false
			);
		};

		this.next = function(type, attr) {

			// console.info('next', type);
			var length = arguments.length;
			return readUntil(
				length > 1 ? {type: type, attr: attr} :
				length > 0 ? {type: type} :
				{ignore: false},
				true
			);
		};


		this.testChar = function(ch) {
			if (arguments.length === 0) return true;
			return !!readCharacter(false, ch);
		};

		this.nextChar = function(ch) {

			if (arguments.length === 0) {
				return readCharacter(true);
			}

			else {
				return readCharacter(true, ch);
			}


		}






	}


	return Tokenizer;

});