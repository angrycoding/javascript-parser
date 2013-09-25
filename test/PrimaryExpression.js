define('../src/Constants', function(AST) {

	return [{
		"input": "null",
		"expected": [[AST.NULL]]
	}, {
		"input": "this",
		"expected": [[AST.THIS]]
	}, {
		"input": "true",
		"expected": [[AST.TRUE]]
	}, {
		"input": "false",
		"expected": [[AST.FALSE]]
	}, {
		"input": "window",
		"expected": [[AST.SELECTOR, "window"]]
	}, {
		"input": "32",
		"expected": [[AST.NUMBER, 32]]
	}, {
		"input": ".32",
		"expected": [[AST.NUMBER, .32]]
	}, {
		"input": "0.32",
		"expected": [[AST.NUMBER, 0.32]]
	}, {
		"input": "43.9",
		"expected": [[AST.NUMBER, 43.9]]
	}, {
		"input": "32e3",
		"expected": [[AST.NUMBER, 32e3]]
	}, {
		"input": ".32e5",
		"expected": [[AST.NUMBER, .32e5]]
	}, {
		"input": "0.32e2",
		"expected": [[AST.NUMBER, 0.32e2]]
	}, {
		"input": "43.9e8",
		"expected": [[AST.NUMBER, 43.9e8]]
	}, {
		"input": "32e+3",
		"expected": [[AST.NUMBER, 32e+3]]
	}, {
		"input": ".32e+5",
		"expected": [[AST.NUMBER, .32e+5]]
	}, {
		"input": "0.32e+2",
		"expected": [[AST.NUMBER, 0.32e+2]]
	}, {
		"input": "43.9e+8",
		"expected": [[AST.NUMBER, 43.9e+8]]
	}, {
		"input": "32e-3",
		"expected": [[AST.NUMBER, 32e-3]]
	}, {
		"input": ".32e-5",
		"expected": [[AST.NUMBER, .32e-5]]
	}, {
		"input": "0.32e-2",
		"expected": [[AST.NUMBER, 0.32e-2]]
	}, {
		"input": "43.9e-8",
		"expected": [[AST.NUMBER, 4.39e-7]]
	}, {
		"input": "32E3",
		"expected": [[AST.NUMBER, 32E3]]
	}, {
		"input": ".32E5",
		"expected": [[AST.NUMBER, .32E5]]
	}, {
		"input": "0.32E2",
		"expected": [[AST.NUMBER, 0.32E2]]
	}, {
		"input": "43.9E8",
		"expected": [[AST.NUMBER, 43.9E8]]
	}, {
		"input": "32E+3",
		"expected": [[AST.NUMBER, 32E+3]]
	}, {
		"input": ".32E+5",
		"expected": [[AST.NUMBER, .32E+5]]
	}, {
		"input": "0.32E+2",
		"expected": [[AST.NUMBER, 0.32E+2]]
	}, {
		"input": "43.9E+8",
		"expected": [[AST.NUMBER, 43.9E+8]]
	}, {
		"input": "32E-3",
		"expected": [[AST.NUMBER, 32E-3]]
	}, {
		"input": ".32E-5",
		"expected": [[AST.NUMBER, .32E-5]]
	}, {
		"input": "0.32E-2",
		"expected": [[AST.NUMBER, 0.32E-2]]
	}, {
		"input": "43.9E-8",
		"expected": [[AST.NUMBER, 43.9E-8]]
	}, {
		"input": "0x41",
		"expected": [[AST.NUMBER, 0x41]]
	}, {
		"input": "0X42",
		"expected": [[AST.NUMBER, 0X42]]
	}, {
		"input": "0xABCD",
		"expected": [[AST.NUMBER, 0xABCD]]
	}, {
		"input": "\"\"",
		"expected": [[AST.STRING, ""]]
	}, {
		"input": "''",
		"expected": [[AST.STRING, ""]]
	}, {
		"input": "\"string\"",
		"expected": [[AST.STRING, "string"]]
	}, {
		"input": "'string'",
		"expected": [[AST.STRING, "string"]]
	}, {
		"input": "\"str'ing\"",
		"expected": [[AST.STRING, "str'ing"]]
	}, {
		"input": "'str\"ing'",
		"expected": [[AST.STRING, "str\"ing"]]
	}, {
		"input": "\"str\\\\ing\"",
		"expected": [[AST.STRING, "str\\ing"]]
	}, {
		"input": "\"str\\bing\"",
		"expected": [[AST.STRING, "str\bing"]]
	}, {
		"input": "\"str\\fing\"",
		"expected": [[AST.STRING, "str\fing"]]
	}, {
		"input": "\"str\\ning\"",
		"expected": [[AST.STRING, "str\ning"]]
	}, {
		"input": "\"str\\ring\"",
		"expected": [[AST.STRING, "str\ring"]]
	}, {
		"input": "\"str\\ting\"",
		"expected": [[AST.STRING, "str\ting"]]
	}, {
		"input": "\"str\\uCAFEing\"",
		"expected": [[AST.STRING, "str\uCAFEing"]]
	}, {
		"input": "\"str\\xCDing\"",
		"expected": [[AST.STRING, "str\xCDing"]]
	}, {
		"input": "\"str\\aing\"",
		"expected": [[AST.STRING, "str\aing"]]
	}, {
		"input": "\"str\\cing\"",
		"expected": [[AST.STRING, "str\cing"]]
	}, {
		"input": "\"str\\eing\"",
		"expected": [[AST.STRING, "str\eing"]]
	}, {
		"input": "\"str\\ging\"",
		"expected": [[AST.STRING, "str\ging"]]
	}, {
		"input": "\"str\\Bing\"",
		"expected": [[AST.STRING, "str\Bing"]]
	}, {
		"input": "'str\\\\ing'",
		"expected": [[AST.STRING, "str\\ing"]]
	}, {
		"input": "'str\\bing'",
		"expected": [[AST.STRING, "str\bing"]]
	}, {
		"input": "'str\\fing'",
		"expected": [[AST.STRING, "str\fing"]]
	}, {
		"input": "'str\\ning'",
		"expected": [[AST.STRING, "str\ning"]]
	}, {
		"input": "'str\\ring'",
		"expected": [[AST.STRING, "str\ring"]]
	}, {
		"input": "'str\\ting'",
		"expected": [[AST.STRING, "str\ting"]]
	}, {
		"input": "'str\\uCAFEing'",
		"expected": [[AST.STRING, "str\uCAFEing"]]
	}, {
		"input": "'str\\xCDing'",
		"expected": [[AST.STRING, "str\xCDing"]]
	}, {
		"input": "'str\\aing'",
		"expected": [[AST.STRING, "str\aing"]]
	}, {
		"input": "'str\\cing'",
		"expected": [[AST.STRING, "str\cing"]]
	}, {
		"input": "'str\\eing'",
		"expected": [[AST.STRING, "str\eing"]]
	}, {
		"input": "'str\\ging'",
		"expected": [[AST.STRING, "str\ging"]]
	}, {
		"input": "'str\\Bing'",
		"expected": [[AST.STRING, "str\Bing"]]
	}, {
		"input": "(null)",
		"expected": [[AST.PARENS, [AST.NULL]]]
	}, {
		"input": "(this)",
		"expected": [[AST.PARENS, [AST.THIS]]]
	}, {
		"input": "(true)",
		"expected": [[AST.PARENS, [AST.TRUE]]]
	}, {
		"input": "(false)",
		"expected": [[AST.PARENS, [AST.FALSE]]]
	}, {
		"input": "(window)",
		"expected": [[AST.PARENS, [AST.SELECTOR, "window"]]]
	}, {
		"input": "(32)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32]]]
	}, {
		"input": "(.32)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32]]]
	}, {
		"input": "(0.32)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32]]]
	}, {
		"input": "(43.9)",
		"expected": [[AST.PARENS, [AST.NUMBER, 43.9]]]
	}, {
		"input": "(32e3)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32e3]]]
	}, {
		"input": "(.32e5)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32e5]]]
	}, {
		"input": "(0.32e2)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32e2]]]
	}, {
		"input": "(43.9e8)",
		"expected": [[AST.PARENS, [AST.NUMBER, 43.9e8]]]
	}, {
		"input": "(32e+3)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32e+3]]]
	}, {
		"input": "(.32e+5)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32e+5]]]
	}, {
		"input": "(0.32e+2)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32e+2]]]
	}, {
		"input": "(43.9e+8)",
		"expected": [[AST.PARENS, [AST.NUMBER, 43.9e+8]]]
	}, {
		"input": "(32e-3)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32e-3]]]
	}, {
		"input": "(.32e-5)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32e-5]]]
	}, {
		"input": "(0.32e-2)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32e-2]]]
	}, {
		"input": "(43.9e-8)",
		"expected": [[AST.PARENS, [AST.NUMBER, 4.39e-7]]]
	}, {
		"input": "(32E3)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32E3]]]
	}, {
		"input": "(.32E5)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32E5]]]
	}, {
		"input": "(0.32E2)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32E2]]]
	}, {
		"input": "(43.9E8)",
		"expected": [[AST.PARENS, [AST.NUMBER, 43.9E8]]]
	}, {
		"input": "(32E+3)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32E+3]]]
	}, {
		"input": "(.32E+5)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32E+5]]]
	}, {
		"input": "(0.32E+2)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32E+2]]]
	}, {
		"input": "(43.9E+8)",
		"expected": [[AST.PARENS, [AST.NUMBER, 43.9E+8]]]
	}, {
		"input": "(32E-3)",
		"expected": [[AST.PARENS, [AST.NUMBER, 32E-3]]]
	}, {
		"input": "(.32E-5)",
		"expected": [[AST.PARENS, [AST.NUMBER, .32E-5]]]
	}, {
		"input": "(0.32E-2)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0.32E-2]]]
	}, {
		"input": "(43.9E-8)",
		"expected": [[AST.PARENS, [AST.NUMBER, 43.9E-8]]]
	}, {
		"input": "(0xABCD)",
		"expected": [[AST.PARENS, [AST.NUMBER, 0xABCD]]]
	}, {
		"input": "(\"string\")",
		"expected": [[AST.PARENS, [AST.STRING, "string"]]]
	}, {
		"input": "('string')",
		"expected": [[AST.PARENS, [AST.STRING, "string"]]]
	}, {
		"input": "([(1), 2])",
		"expected": [[AST.PARENS, [AST.ARRAY, [AST.PARENS, [AST.NUMBER, 1]], [AST.NUMBER, 2]]]]
	}, {
		"input": "[]",
		"expected": [[AST.ARRAY]]
	}, {
		"input": "[[]]",
		"expected": [[AST.ARRAY, [AST.ARRAY]]]
	}, {
		"input": "[,]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED]]]
	}, {
		"input": "[,,]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.UNDEFINED]]]
	}, {
		"input": "[,,,]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.UNDEFINED], [AST.UNDEFINED]]]
	}, {
		"input": "[1]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1]]]
	}, {
		"input": "[null]",
		"expected": [[AST.ARRAY, [AST.NULL]]]
	}, {
		"input": "[this]",
		"expected": [[AST.ARRAY, [AST.THIS]]]
	}, {
		"input": "[true]",
		"expected": [[AST.ARRAY, [AST.TRUE]]]
	}, {
		"input": "[false]",
		"expected": [[AST.ARRAY, [AST.FALSE]]]
	}, {
		"input": "[window]",
		"expected": [[AST.ARRAY, [AST.SELECTOR, "window"]]]
	}, {
		"input": "[.34]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 0.34]]]
	}, {
		"input": "[3.14e0]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 3.14e0]]]
	}, {
		"input": "[3.14e+2]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 3.14e+2]]]
	}, {
		"input": "[3.14E-2]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 3.14e-2]]]
	}, {
		"input": "[0xC0FFEE]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 0xC0FFEE]]]
	}, {
		"input": "['string']",
		"expected": [[AST.ARRAY, [AST.STRING, "string"]]]
	}, {
		"input": "[\"string\"]",
		"expected": [[AST.ARRAY, [AST.STRING, "string"]]]
	}, {
		"input": "[1, 2]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1], [AST.NUMBER, 2]]]
	}, {
		"input": "[(1), 2]",
		"expected": [[AST.ARRAY, [AST.PARENS, [AST.NUMBER, 1]], [AST.NUMBER, 2]]]
	}, {
		"input": "[1, 2, 3]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1], [AST.NUMBER, 2], [AST.NUMBER, 3]]]
	}, {
		"input": "[,1]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1]]]
	}, {
		"input": "[,,1]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.UNDEFINED], [AST.NUMBER, 1]]]
	},  {
		"input": "[,,,1]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.UNDEFINED], [AST.UNDEFINED], [AST.NUMBER, 1]]]
	}, {
		"input": "[,1, 2]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1], [AST.NUMBER, 2]]]
	}, {
		"input": "[,,1, 2]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.UNDEFINED], [AST.NUMBER, 1], [AST.NUMBER, 2]]]
	}, {
		"input": "[1,]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1]]]
	}, {
		"input": "[1,,]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1], [AST.UNDEFINED]]]
	}, {
		"input": "[1,,,]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1], [AST.UNDEFINED], [AST.UNDEFINED]]]
	}, {
		"input": "[1,,2]",
		"expected": [[AST.ARRAY, [AST.NUMBER, 1], [AST.UNDEFINED], [AST.NUMBER, 2]]]
	}, {
		"input": "[,1,,2]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1], [AST.UNDEFINED], [AST.NUMBER, 2]]]
	}, {
		"input": "[,1,,2,]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1], [AST.UNDEFINED], [AST.NUMBER, 2]]]
	}, {
		"input": "[,1,,2,,]",
		"expected": [[AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1], [AST.UNDEFINED], [AST.NUMBER, 2], [AST.UNDEFINED]]]
	}, {
		"input": "([,1,,2,,])",
		"expected": [[AST.PARENS, [AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1], [AST.UNDEFINED], [AST.NUMBER, 2], [AST.UNDEFINED]]]]
	}, {
		"input": "([,1,,2,[,[],],])",
		"expected": [[AST.PARENS, [AST.ARRAY, [AST.UNDEFINED], [AST.NUMBER, 1], [AST.UNDEFINED], [AST.NUMBER, 2], [AST.ARRAY, [AST.UNDEFINED], [AST.ARRAY]]]]]
	},



	{
		"input": "({})",
		"expected": [[AST.PARENS, [AST.OBJECT]]]
	}, {
		"input": "({foo: null})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['foo', [AST.NULL]]]]]
	}, {
		"input": "({return: this})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['return', [AST.THIS]]]]]
	}, {
		"input": "({'key': true})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['key', [AST.TRUE]]]]]
	}, {
		"input": "({0: false})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['0', [AST.FALSE]]]]]
	}, {
		"input": "({14: 12})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['14', [AST.NUMBER, 12]]]]]
	}, {
		"input": "({.14: 'bar'})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['0.14', [AST.STRING, 'bar']]]]]
	}, {
		"input": "({3.14: 0xCAFE})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['3.14', [AST.NUMBER, 0xCAFE]]]]]
	}, {
		"input": "({14e3: (null)})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['14000', [AST.PARENS, [AST.NULL]]]]]]
	}, {
		"input": "({.14e3: []})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['140', [AST.ARRAY]]]]]
	}, {
		"input": "({3.14e3: {}})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['3140', [AST.OBJECT]]]]]
	}, {
		"input": "({14e+3: [1]})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['14000', [AST.ARRAY, [AST.NUMBER, 1]]]]]]
	}, {
		"input": "({.14e+3: {'PI': 3.14}})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['140', [AST.OBJECT, ['PI', [AST.NUMBER, 3.14]]]]]]]
	}, {
		"input": "({3.14e+3: .3})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['3140', [AST.NUMBER, .3]]]]]
	}, {
		"input": "({14e-3: 3E4})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['0.014', [AST.NUMBER, 3E4]]]]]
	}, {
		"input": "({.14e-3: [,,]})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['0.00014', [AST.ARRAY, [AST.UNDEFINED], [AST.UNDEFINED]]]]]]
	}, {
		"input": "({3.14e-3: 'bar',})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['0.00314', [AST.STRING, 'bar']]]]]
	}, {
		"input": "({1: 2, 3: true, 5: '6'})",
		"expected": [[AST.PARENS, [AST.OBJECT, ['1', [AST.NUMBER, 2]], ['3', [AST.TRUE]], ['5', [AST.STRING, '6']]]]]
	}

	/*

	, {
		"input": "\"",
		"exception": {"code": "unexpected_illegal"}
	}, {
		"input": "\'",
		"exception": {"code": "unexpected_illegal"}
	},


	{
		"input": "()",
		"exception": {"code": "unexpected_token"}
	}

	// correctException
	{
		"input": "(this",
		"exception": {"expected": ")", "found": -1}
	},

	// wrongException
	{
		"input": "(this",
		"exception": {"expected": "x)", "found": -1}
	},

	// unexpectedException
	{
		"input": "(this",
		"expected": [[AST.PARENS, [AST.THIS]]]
	},

	// unexpectedSuccess
	{
		"input": "(this)",
		"exception": {"expected": ")", "found": -1}
	},

	*/

	];

});