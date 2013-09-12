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


		this.addToken = function() {

			var tokenName = null, expression;

			if (arguments.length === 0) return;

			if (arguments.length === 1) {
				expression = arguments[0];
			}

			else if (arguments.length > 1) {
				tokenName = arguments[0];
				expression = arguments[1];
			}

			// if (!isString(tokenName)) return;
			// tokenName to uppercase?


			if (isRegExp(expression)) {
				expression = expression.toString();
				expression = expression.slice(1, -1);
			} else expression = escapeRegExp(expression);


			// if (!isString(expression)) return;

			var ignore = false;

			if (tokenName && tokenName[0] === '@') {
				ignore = true;
				tokenName = tokenName.substr(1);
			}

			tokenDefinitions[0].push('(' + expression + ')');
			tokenDefinitions.push([ignore, tokenName]);

		};



		this.tokenize = function(input) {
			tokenBuffer = [];
			inputString = input;
			inputStringLength = input.length;
			tokenDefinitions[0] = new RegExp(
				tokenDefinitions[0].join('|'), 'g'
			);
		};





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





		function testAhead(token, frag) {

			if (frag instanceof Array) {
				for (var c = 0; c < frag.length; c++) {
					if (!testAhead(token, frag[c])) continue;
					return true;
				}
			}

			else {
				var key = 'value';
				if (frag[0] === '@') {
					key = 'type';
					frag = frag.slice(1);
				}
				// console.info(key, token[key], frag);
				return (token[key] === frag);
			}


		}


		this.test = function(selector) {
			var selector = Array.prototype.slice.call(arguments);

			var notIgnoredTokensCount = 0;
			for (var c = 0; c < tokenBuffer.length; c++) {
				if (tokenBuffer[c].ignore) continue;
				notIgnoredTokensCount++;
			}

			for (var c = 0; c < selector.length - notIgnoredTokensCount; c++) {
				readTokens();
			}

			var offset = 0;
			for (var c = 0; c < tokenBuffer.length; c++) {

				var token = tokenBuffer[c],
					frag = selector[offset];


				if (!testAhead(token, frag)) {

					if (token.ignore) {
						// console.info('FAIL but continue');
						continue;
					}

					else {
						// console.info('FAIL and return');
						return;
					}
				} else {
					// console.info('SUCCESS');
					offset++;
					if (offset >= selector.length) break;
				}
			}

			// console.info(c);
			// dump(tokenBuffer);

			return 'true?';


		};





		this.next = function(selector) {
			var resultArr = [];
			var selector = Array.prototype.slice.call(arguments);

			if (!selector.length) {
				if (!tokenBuffer.length)
					readTokens();
				while (tokenBuffer.length) {
					var token = tokenBuffer.shift();
					if (!token.ignore) return token;
				}
			}


			var notIgnoredTokensCount = 0;

			for (var c = 0; c < tokenBuffer.length; c++) {
				if (tokenBuffer[c].ignore) continue;
				notIgnoredTokensCount++;
			}

			for (var c = 0; c < selector.length - notIgnoredTokensCount; c++) {
				readTokens();
			}

			var offset = 0;
			for (var c = 0; c < tokenBuffer.length; c++) {

				var token = tokenBuffer[c],
					frag = selector[offset];


				if (!testAhead(token, frag)) {

					if (token.ignore) {
						// console.info('FAIL but continue');
						continue;
					}

					else {
						// console.info('FAIL and return');
						return;
					}
				} else {
					resultArr.push(token);
					// console.info('SUCCESS');
					offset++;
					if (offset >= selector.length) break;
				}
			}

			// console.info(c);
			tokenBuffer.splice(0, c + 1);
			// dump(resultArr);

			if (resultArr.length === 1)
				return resultArr[0];
			else return resultArr;

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