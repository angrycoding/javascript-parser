require('./krang.js')({
	cache: false,
	debug: false
}).require(['src/Parser', 'test/test'], function(Parser, tests) {

	function execTest(test) {
		var output, input = test.input;
		var expected = JSON.stringify(test.expected);


		try {
			output = Parser(input);
			output = JSON.stringify(output);
			if (output === expected) {
				console.info('[ OK ]', input);
			} else {
				console.info('[ FAIL ]', output, expected);
			}
		} catch (exception) {
			console.info(exception);
		}
	}

	for (var c = 0; c < tests.length; c++) {
		execTest(tests[c]);
	}

});