define('../src/Constants', function(AST) {

	return [{
		"input": "10 + 2",
		"expected": [[AST.ADD, [AST.NUMBER, 10], [AST.NUMBER, 2]]]
	}, {
		"input": "10 - 2",
		"expected": [[AST.SUB, [AST.NUMBER, 10], [AST.NUMBER, 2]]]
	}, {
		"input": "10 + 2 - 3",
		"expected": [[AST.SUB, [AST.ADD, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 + 2 + 3",
		"expected": [[AST.ADD, [AST.ADD, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 - 2 + 3",
		"expected": [[AST.ADD, [AST.SUB, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}, {
		"input": "10 - 2 - 3",
		"expected": [[AST.SUB, [AST.SUB, [AST.NUMBER, 10], [AST.NUMBER, 2]], [AST.NUMBER,3]]]
	}];

});