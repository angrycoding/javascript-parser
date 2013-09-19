define(function() {

	var T_EOF = -1;
	var T_ERR = -2;

	var IGNORE_START = -3;
	var TOKEN_START = 0;


	function escapeRegExp(value) {
		return value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	}

	function isRegExp(value) {
		return (value instanceof RegExp);
	}

	function Tokenizer() {

		var tokenRegExp = [];
		var tokenInfo = [];
		var tokenBuffer = [];
		var inputString, inputLength;

		var lastMatchId = TOKEN_START;
		var lastIgnoreId = IGNORE_START;


		// match next token and put it into the tokenBuffer
		function readTokenToBuffer() {
			var startPos, matchPos, matchStr, match, length;
			for (;;) if (tokenRegExp.lastIndex !== inputLength) {
				startPos = tokenRegExp.lastIndex;
				if (match = tokenRegExp.exec(inputString)) {
					matchPos = match.index;
					// check if we have T_ERR token
					if (length = matchPos - startPos) {
						tokenBuffer.push({
							type: T_ERR,
							pos: startPos,
							value: inputString.substr(startPos, length)
						});
					}
					length = match.length;
					// find matched group index
					while (!(matchStr = match[length--]));
					// obtain token info
					match = tokenInfo[length];
					// match next token in case if this one is ignored
					if (match === IGNORE_START) continue;
					// return matched token
					return tokenBuffer.push({
						type: match,
						pos: matchPos,
						value: matchStr
					});
				}
				// return T_ERR token in case if we couldn't match anything
				else return (
					tokenRegExp.lastIndex = inputLength,
					length = inputLength - startPos &&
					tokenBuffer.push({
						type: T_ERR,
						pos: startPos,
						value: inputString.substr(startPos, length)
					})
				);
			}
			// return T_EOF if we reached end of file
			else return tokenBuffer.push({
				type: T_EOF,
				pos: inputLength
			});
		}

		// retrieve token at specific position in the buffer
		// expand buffer in case if offset > buffer size
		function getTokenFromBuffer(offset) {
			var toRead = offset - tokenBuffer.length + 1;
			while (toRead-- > 0) readTokenToBuffer();
			return tokenBuffer[offset];
		}

		function addExpression(args, ignore) {
			if (args.length === 0) return;

			var tokenId, expression;

			if (args.length === 1) {
				expression = args[0];
				tokenId = (ignore ? IGNORE_START : TOKEN_START);
			} else {
				expression = args[1], tokenId = args[0], tokenId = (
					this.hasOwnProperty(tokenId) ?
					this[tokenId] : this[tokenId] = (
						ignore ? --lastIgnoreId : ++lastMatchId
					)
				);
			}

			if (isRegExp(expression)) {
				expression = expression.toString();
				expression = expression.slice(1, -1);
			} else expression = escapeRegExp(expression);

			tokenRegExp.push('(' + expression + ')');
			tokenInfo.push(tokenId);
		}







		function compare(token, selector) {

			if (selector instanceof Array) {
				for (var c = 0; c < selector.length; c++) {
					var cResult = compare(token, selector[c]);
					if (cResult !== 1) continue;
					return cResult;
				}
			}

			var key = (typeof selector === 'number' ? 'type' : 'value');
			if (key === 'value' && token.type === T_ERR) return 0;

			if (token[key] === selector) return 1;
			else if (token.type <= IGNORE_START) return -1;
			else return 0;

		}


		function consume(sequence, move) {

			var result = [], sequencePos = 0, bufferPos = 0;

			if (!sequence.length) {

				for (;;) {
					var token = getTokenFromBuffer(bufferPos);
					if (token.type <= IGNORE_START) {
						bufferPos++;
						continue;
					} else if (move) {
						tokenBuffer.splice(0, bufferPos + 1);
					}
					return token;
				}


			}

			else for (;;) {

				var sequenceFrag = sequence[sequencePos];
				var token = getTokenFromBuffer(bufferPos);
				var comparison = compare(token, sequenceFrag);

				// console.info('compare', token, sequenceFrag, comparison);

				if (comparison === 0) return;

				if (comparison === -1) {
					bufferPos++;
				}

				else if (sequencePos < sequence.length - 1) {
					result.push(token);
					sequencePos++;
					bufferPos++;
				}

				else if (comparison === 1) {
					result.push(token);

					if (move) tokenBuffer.splice(0, bufferPos + 1);

					if (result.length === 1)
						return result[0];
					else return result;
				}

			}


		}



		this.match = function() {
			addExpression.call(this, arguments, false);
		};

		this.ignore = function() {
			addExpression.call(this, arguments, true);
		};

		this.tokenize = function(input) {
			tokenBuffer = [];
			inputString = input;
			inputLength = input.length;
			if (tokenRegExp instanceof Array) {
				tokenRegExp = tokenRegExp.join('|');
				tokenRegExp = new RegExp(tokenRegExp, 'g');
			} else tokenRegExp.lastIndex = 0;
		};




		function readCharacter(move) {

			var pos = (
				tokenBuffer.length ?
				tokenBuffer[0].pos :
				tokenRegExp.lastIndex
			);

			var ch = (
				pos === inputLength ?
				'EOF' : inputString[pos]
			);

			if (arguments.length > 1 && arguments[1] !== ch) {
				return;
			}

			if (move && pos < inputLength) {
				tokenBuffer = [];
				tokenRegExp.lastIndex =
				pos + 1;
			}

			return ch;
		}





		this.getFragment = function() {
			for (var c = 0; c < tokenBuffer.length; c++) {
				if (tokenBuffer[c].ignore) continue;
				return tokenBuffer[c].value || tokenBuffer[c].type;
			}
		};

		this.getLineNumber = function() {
			var code, start = -1, lineNumber = 1;

			for (var c = 0; c < tokenBuffer.length; c++) {
				if (tokenBuffer[c].ignore) continue;
				while (++start < tokenBuffer[c].pos) {
					code = inputString.charCodeAt(start);
					if (code === 10 || code === 13) lineNumber++;
				}
				return lineNumber;
			}

		};





		this.test = function(selector) {

			return !!consume(
				Array.prototype.slice.call(arguments),
				false
			);



		};





		this.next = function() {
			return consume(
				Array.prototype.slice.call(arguments),
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

	Tokenizer.T_EOF = T_EOF;
	Tokenizer.T_ERR = T_ERR;


	return Tokenizer;

});