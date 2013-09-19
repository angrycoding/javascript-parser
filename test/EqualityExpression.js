define('../src/Constants', function(AST) {

	return [{
		"input": "10 == 10",
		"expected": [[AST.EQ, [AST.NUMBER, 10], [AST.NUMBER, 10]]]
	}, {
		"input": "10 === 10",
		"expected": [[AST.SEQ, [AST.NUMBER, 10], [AST.NUMBER, 10]]]
	}, {
		"input": "10 != 10",
		"expected": [[AST.NEQ, [AST.NUMBER, 10], [AST.NUMBER, 10]]]
	}, {
		"input": "10 !== 10",
		"expected": [[AST.SNEQ, [AST.NUMBER, 10], [AST.NUMBER, 10]]]
	}, {
		"input": "10 == 20 == 30",
		"expected": [[AST.EQ, [AST.EQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 == 20 === 30",
		"expected": [[AST.SEQ, [AST.EQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 == 20 != 30",
		"expected": [[AST.NEQ, [AST.EQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 == 20 !== 30",
		"expected": [[AST.SNEQ, [AST.EQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 === 20 == 30",
		"expected": [[AST.EQ, [AST.SEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 === 20 === 30",
		"expected": [[AST.SEQ, [AST.SEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 === 20 != 30",
		"expected": [[AST.NEQ, [AST.SEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 === 20 !== 30",
		"expected": [[AST.SNEQ, [AST.SEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 != 20 == 30",
		"expected": [[AST.EQ, [AST.NEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 != 20 === 30",
		"expected": [[AST.SEQ, [AST.NEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 != 20 != 30",
		"expected": [[AST.NEQ, [AST.NEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 != 20 !== 30",
		"expected": [[AST.SNEQ, [AST.NEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 !== 20 == 30",
		"expected": [[AST.EQ, [AST.SNEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 !== 20 === 30",
		"expected": [[AST.SEQ, [AST.SNEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 !== 20 != 30",
		"expected": [[AST.NEQ, [AST.SNEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}, {
		"input": "10 !== 20 !== 30",
		"expected": [[AST.SNEQ, [AST.SNEQ, [AST.NUMBER, 10], [AST.NUMBER, 20]], [AST.NUMBER, 30]]]
	}];

});