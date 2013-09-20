require('./krang.js')({
	cache: false,
	debug: false
}).require(['src/parser/Parser', 'test/test'], function(Parser, tests) {

	function unexpectedSuccess(input, expectedException, actualResult) {
		console.info('[ FAIL - unexpectedSuccess ]', input, expectedException, actualResult);
	}

	function unexpectedException(input, actualException) {
		console.info('[ FAIL - unexpectedException ]', input, actualException);
	}

	function wrongException(input, expectedException, actualException) {
		console.info('[ FAIL - wrongException ]', input, expectedException, actualException);
	}

	function wrongResult(input, expectedResult, actualResult) {
		console.info('[ FAIL - wrongResult ]', input, expectedResult, actualResult);
	}

	function correctResult(input, actualResult) {
		console.info('[ OK - correctResult ]', input, actualResult);
	}

	function correctException(input, actualException) {
		console.info('[ OK - correctException ]', input, actualException);
	}

	function compareExceptions(expectedException, actualException) {
		for (var key in expectedException)
			if (actualException[key] !== expectedException[key])
				return false;
		return true;
	}

	function execTest(test) {

		var testInput = test.input;
		var expectedException = test.exception;
		var testExpected = JSON.stringify(test.expected);


		try {
			var output = Parser(testInput);
			output = JSON.stringify(output);
			if (expectedException)
				unexpectedSuccess(testInput, expectedException, output);
			else if (output === testExpected)
				correctResult(testInput, output);
			else wrongResult(testInput, output, testExpected);
		} catch (actualException) {
			if (!expectedException)
				unexpectedException(testInput, actualException);
			else if (compareExceptions(expectedException, actualException))
				correctException(testInput, actualException);
			else wrongException(testInput, expectedException, actualException);
		}
	}

	for (var c = 0; c < tests.length; c++) {
		execTest(tests[c]);
	}

});