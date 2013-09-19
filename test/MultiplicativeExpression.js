define('../src/Constants', function(AST) {

	return [{
		"input": "10 * 2",
		"expected": [[AST.MUL, [AST.NUMBER, 10], [AST.NUMBER, 2]]]
	}, {
		"input": "10 / 2",
		"expected": [[AST.DIV, [AST.NUMBER, 10], [AST.NUMBER, 2]]]
	}, {
		"input": "10 % 2",
		"expected": [[AST.MOD, [AST.NUMBER, 10], [AST.NUMBER, 2]]]
	}, {
		"input": "10 * 2 / 3",
		"expected": [[AST.DIV, [AST.MUL, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 * 2 % 3",
		"expected": [[AST.MOD, [AST.MUL, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 * 2 * 3",
		"expected": [[AST.MUL, [AST.MUL, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 / 2 * 3",
		"expected": [[AST.MUL, [AST.DIV, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 / 2 % 3",
		"expected": [[AST.MOD, [AST.DIV, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 / 2 / 3",
		"expected": [[AST.DIV, [AST.DIV, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 % 2 * 3",
		"expected": [[AST.MUL, [AST.MOD, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 % 2 / 3",
		"expected": [[AST.DIV, [AST.MOD, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 % 2 % 3",
		"expected": [[AST.MOD, [AST.MOD, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}];

});