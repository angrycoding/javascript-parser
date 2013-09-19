define('../src/Constants', function(AST) {

	return [{
		"input": "'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.STRING, 'foo'], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.NUMBER, 10], [AST.TRUE]]]
	}, {
		"input": "10 < 3",
		"expected": [[AST.LT, [AST.NUMBER, 10], [AST.NUMBER, 3]]]
	}, {
		"input": "30 > 12e-3",
		"expected": [[AST.GT, [AST.NUMBER, 30], [AST.NUMBER, 0.012]]]
	}, {
		"input": "3.14 >= 3.15",
		"expected": [[AST.GE, [AST.NUMBER, 3.14], [AST.NUMBER, 3.15]]]
	}, {
		"input": "42 <= 45",
		"expected": [[AST.LE, [AST.NUMBER, 42], [AST.NUMBER, 45]]]
	}, {
		"input": "'x' in 'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.IN, [AST.STRING, 'x'], [AST.STRING, 'foo']], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "'x' in 10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.IN, [AST.STRING, 'x'], [AST.NUMBER, 10]], [AST.TRUE]]]
	}, {
		"input": "'x' in 10 < 3",
		"expected": [[AST.LT, [AST.IN, [AST.STRING, 'x'], [AST.NUMBER, 10]], [AST.NUMBER, 3]]]
	}, {
		"input": "'x' in 30 > 12e-3",
		"expected": [[AST.GT, [AST.IN, [AST.STRING, 'x'], [AST.NUMBER, 30]], [AST.NUMBER, 0.012]]]
	}, {
		"input": "'x' in 3.14 >= 3.15",
		"expected": [[AST.GE, [AST.IN, [AST.STRING, 'x'], [AST.NUMBER, 3.14]], [AST.NUMBER, 3.15]]]
	}, {
		"input": "'x' in 42 <= 45",
		"expected": [[AST.LE, [AST.IN, [AST.STRING, 'x'], [AST.NUMBER, 42]], [AST.NUMBER, 45]]]
	}, {
		"input": "true instanceof 'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.INSTANCEOF, [AST.TRUE], [AST.STRING, 'foo']], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "true instanceof 10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.INSTANCEOF, [AST.TRUE], [AST.NUMBER, 10]], [AST.TRUE]]]
	}, {
		"input": "true instanceof 10 < 3",
		"expected": [[AST.LT, [AST.INSTANCEOF, [AST.TRUE], [AST.NUMBER, 10]], [AST.NUMBER, 3]]]
	}, {
		"input": "true instanceof 30 > 12e-3",
		"expected": [[AST.GT, [AST.INSTANCEOF, [AST.TRUE], [AST.NUMBER, 30]], [AST.NUMBER, 0.012]]]
	}, {
		"input": "true instanceof 3.14 >= 3.15",
		"expected": [[AST.GE, [AST.INSTANCEOF, [AST.TRUE], [AST.NUMBER, 3.14]], [AST.NUMBER, 3.15]]]
	}, {
		"input": "true instanceof 42 <= 45",
		"expected": [[AST.LE, [AST.INSTANCEOF, [AST.TRUE], [AST.NUMBER, 42]], [AST.NUMBER, 45]]]
	}, {
		"input": "3 < 'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.LT, [AST.NUMBER, 3], [AST.STRING, 'foo']], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "3 < 10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.LT, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.TRUE]]]
	}, {
		"input": "3 < 10 < 3",
		"expected": [[AST.LT, [AST.LT, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.NUMBER, 3]]]
	}, {
		"input": "3 < 30 > 12e-3",
		"expected": [[AST.GT, [AST.LT, [AST.NUMBER, 3], [AST.NUMBER, 30]], [AST.NUMBER, 0.012]]]
	}, {
		"input": "3 < 3.14 >= 3.15",
		"expected": [[AST.GE, [AST.LT, [AST.NUMBER, 3], [AST.NUMBER, 3.14]], [AST.NUMBER, 3.15]]]
	}, {
		"input": "3 < 42 <= 45",
		"expected": [[AST.LE, [AST.LT, [AST.NUMBER, 3], [AST.NUMBER, 42]], [AST.NUMBER, 45]]]
	}, {
		"input": "3 > 'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.GT, [AST.NUMBER, 3], [AST.STRING, 'foo']], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "3 > 10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.GT, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.TRUE]]]
	}, {
		"input": "3 > 10 < 3",
		"expected": [[AST.LT, [AST.GT, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.NUMBER, 3]]]
	}, {
		"input": "3 > 30 > 12e-3",
		"expected": [[AST.GT, [AST.GT, [AST.NUMBER, 3], [AST.NUMBER, 30]], [AST.NUMBER, 0.012]]]
	}, {
		"input": "3 > 3.14 >= 3.15",
		"expected": [[AST.GE, [AST.GT, [AST.NUMBER, 3], [AST.NUMBER, 3.14]], [AST.NUMBER, 3.15]]]
	}, {
		"input": "3 > 42 <= 45",
		"expected": [[AST.LE, [AST.GT, [AST.NUMBER, 3], [AST.NUMBER, 42]], [AST.NUMBER, 45]]]
	}, {
		"input": "3 >= 'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.GE, [AST.NUMBER, 3], [AST.STRING, 'foo']], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "3 >= 10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.GE, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.TRUE]]]
	}, {
		"input": "3 >= 10 < 3",
		"expected": [[AST.LT, [AST.GE, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.NUMBER, 3]]]
	}, {
		"input": "3 >= 30 > 12e-3",
		"expected": [[AST.GT, [AST.GE, [AST.NUMBER, 3], [AST.NUMBER, 30]], [AST.NUMBER, 0.012]]]
	}, {
		"input": "3 >= 3.14 >= 3.15",
		"expected": [[AST.GE, [AST.GE, [AST.NUMBER, 3], [AST.NUMBER, 3.14]], [AST.NUMBER, 3.15]]]
	}, {
		"input": "3 >= 42 <= 45",
		"expected": [[AST.LE, [AST.GE, [AST.NUMBER, 3], [AST.NUMBER, 42]], [AST.NUMBER, 45]]]
	}, {
		"input": "3 <= 'foo' in {foo: 'bar'}",
		"expected": [[AST.IN, [AST.LE, [AST.NUMBER, 3], [AST.STRING, 'foo']], [AST.OBJECT, ['foo', [AST.STRING, 'bar']]]]]
	}, {
		"input": "3 <= 10 instanceof true",
		"expected": [[AST.INSTANCEOF, [AST.LE, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.TRUE]]]
	}, {
		"input": "3 <= 10 < 3",
		"expected": [[AST.LT, [AST.LE, [AST.NUMBER, 3], [AST.NUMBER, 10]], [AST.NUMBER, 3]]]
	}, {
		"input": "3 <= 30 > 12e-3",
		"expected": [[AST.GT, [AST.LE, [AST.NUMBER, 3], [AST.NUMBER, 30]], [AST.NUMBER, 0.012]]]
	}, {
		"input": "3 <= 3.14 >= 3.15",
		"expected": [[AST.GE, [AST.LE, [AST.NUMBER, 3], [AST.NUMBER, 3.14]], [AST.NUMBER, 3.15]]]
	}, {
		"input": "3 <= 42 <= 45",
		"expected": [[AST.LE, [AST.LE, [AST.NUMBER, 3], [AST.NUMBER, 42]], [AST.NUMBER, 45]]]
	}];

});