define('../src/Constants', function(AST) {

	return [{
		"input": "null++",
		"expected": [[AST.INC, [AST.NULL]]]
	}, {
		"input": "this++",
		"expected": [[AST.INC, [AST.THIS]]]
	}, {
		"input": "true++",
		"expected": [[AST.INC, [AST.TRUE]]]
	}, {
		"input": "false++",
		"expected": [[AST.INC, [AST.FALSE]]]
	}, {
		"input": "32++",
		"expected": [[AST.INC, [AST.NUMBER, 32]]]
	}, {
		"input": ".32++",
		"expected": [[AST.INC, [AST.NUMBER, .32]]]
	}, {
		"input": "0.32++",
		"expected": [[AST.INC, [AST.NUMBER, 0.32]]]
	}, {
		"input": "32e3++",
		"expected": [[AST.INC, [AST.NUMBER, 32e3]]]
	}, {
		"input": ".32e3++",
		"expected": [[AST.INC, [AST.NUMBER, .32e3]]]
	}, {
		"input": "0.32e3++",
		"expected": [[AST.INC, [AST.NUMBER, 0.32e3]]]
	}, {
		"input": "32e+3++",
		"expected": [[AST.INC, [AST.NUMBER, 32e+3]]]
	}, {
		"input": ".32e+3++",
		"expected": [[AST.INC, [AST.NUMBER, .32e+3]]]
	}, {
		"input": "0.32e+3++",
		"expected": [[AST.INC, [AST.NUMBER, 0.32e+3]]]
	}, {
		"input": "32e-3++",
		"expected": [[AST.INC, [AST.NUMBER, 32e-3]]]
	}, {
		"input": ".32e-3++",
		"expected": [[AST.INC, [AST.NUMBER, .32e-3]]]
	}, {
		"input": "0.32e-3++",
		"expected": [[AST.INC, [AST.NUMBER, 0.32e-3]]]
	}, {
		"input": "0xBABE++",
		"expected": [[AST.INC, [AST.NUMBER, 0xBABE]]]
	}, {
		"input": "'string'++",
		"expected": [[AST.INC, [AST.STRING, "string"]]]
	}, {
		"input": "(123)++",
		"expected": [[AST.INC, [AST.PARENS, [AST.NUMBER, 123]]]]
	}, {
		"input": "null--",
		"expected": [[AST.DEC, [AST.NULL]]]
	}, {
		"input": "this--",
		"expected": [[AST.DEC, [AST.THIS]]]
	}, {
		"input": "true--",
		"expected": [[AST.DEC, [AST.TRUE]]]
	}, {
		"input": "false--",
		"expected": [[AST.DEC, [AST.FALSE]]]
	}, {
		"input": "32--",
		"expected": [[AST.DEC, [AST.NUMBER, 32]]]
	}, {
		"input": ".32--",
		"expected": [[AST.DEC, [AST.NUMBER, .32]]]
	}, {
		"input": "0.32--",
		"expected": [[AST.DEC, [AST.NUMBER, 0.32]]]
	}, {
		"input": "32e3--",
		"expected": [[AST.DEC, [AST.NUMBER, 32e3]]]
	}, {
		"input": ".32e3--",
		"expected": [[AST.DEC, [AST.NUMBER, .32e3]]]
	}, {
		"input": "0.32e3--",
		"expected": [[AST.DEC, [AST.NUMBER, 0.32e3]]]
	}, {
		"input": "32e+3--",
		"expected": [[AST.DEC, [AST.NUMBER, 32e+3]]]
	}, {
		"input": ".32e+3--",
		"expected": [[AST.DEC, [AST.NUMBER, .32e+3]]]
	}, {
		"input": "0.32e+3--",
		"expected": [[AST.DEC, [AST.NUMBER, 0.32e+3]]]
	}, {
		"input": "32e-3--",
		"expected": [[AST.DEC, [AST.NUMBER, 32e-3]]]
	}, {
		"input": ".32e-3--",
		"expected": [[AST.DEC, [AST.NUMBER, .32e-3]]]
	}, {
		"input": "0.32e-3--",
		"expected": [[AST.DEC, [AST.NUMBER, 0.32e-3]]]
	}, {
		"input": "0xBABE--",
		"expected": [[AST.DEC, [AST.NUMBER, 0xBABE]]]
	}, {
		"input": "'string'--",
		"expected": [[AST.DEC, [AST.STRING, "string"]]]
	}, {
		"input": "(123)--",
		"expected": [[AST.DEC, [AST.PARENS, [AST.NUMBER, 123]]]]
	}];

});