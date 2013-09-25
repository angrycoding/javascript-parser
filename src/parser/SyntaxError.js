define(['TokenStream', 'Messages'], function(TokenStream, Messages) {

	var Tokenizer = TokenStream.constructor;
	var T_EOF = Tokenizer.T_EOF;
	var T_ERR = Tokenizer.T_ERR;

	function placeHolders(str, replacements) {
		return str.replace(/\{([^\}]*)\}/g, function(match, key) {
			return (
				replacements.hasOwnProperty(key) ?
				replacements[key] : match
			);
		});
	}

	function SyntaxError(args) {

		if (!(this instanceof arguments.callee)) {
			var args = Array.prototype.slice.call(arguments);
			throw new SyntaxError(args);
		}

		if (!args.length) {
			var found = TokenStream.next();
			if (found.type === T_EOF)
				args.push('unexpected_eof');
			else if (found.type === T_ERR)
				args.push('unexpected_illegal');
			else args.push('unexpected_token');
			args.push(found.value);
		}

		var errorCode = args.shift(),
			errorMessage = errorCode;

		if (Messages.hasOwnProperty(errorCode))
			errorMessage = Messages[errorCode];

		var fileName = TokenStream.getFileName(),
			lineNumber = TokenStream.getLineNumber();

		var message = placeHolders(Messages.syntax_error, {
			fileName: fileName,
			lineNumber: lineNumber,
			message: placeHolders(errorMessage, args)
		});


		return {
			code: errorCode,
			file: fileName,
			line: lineNumber,
			toString: function() {
				return message;
			}
		};
	}

	return SyntaxError;

});