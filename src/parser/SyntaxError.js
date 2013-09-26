define(['Tokens', 'Messages'], function(Tokens, Messages) {

	var placeHolderRegExp = /\{([^\}]*)\}/g;

	function placeHolders(str, replacements) {
		return str.replace(placeHolderRegExp, function(match, key) {
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
			var found = Tokens.next();
			if (found.type === Tokens.$EOF)
				args.push('unexpected_eof');
			else if (found.type === Tokens.$ERR)
				args.push('unexpected_illegal');
			else args.push('unexpected_token');
			args.push(found.value);
		}

		var errorCode = args.shift(),
			errorMessage = errorCode;

		if (Messages.hasOwnProperty(errorCode))
			errorMessage = Messages[errorCode];

		var fileName = Tokens.getFileName(),
			lineNumber = Tokens.getLineNumber();

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