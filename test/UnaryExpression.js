define('../src/Constants', function(AST) {

	return [{
		"input": "delete 10",
		"expected": [[AST.DELETE, [AST.NUMBER, 10]]]
	}, {
		"input": "void true",
		"expected": [[AST.VOID, [AST.TRUE]]]
	}, {
		"input": "typeof 'string'",
		"expected": [[AST.TYPEOF, [AST.STRING, "string"]]]
	}, {
		"input": "++10",
		"expected": [[AST.UINC, [AST.NUMBER, 10]]]
	}, {
		"input": "--10",
		"expected": [[AST.UDEC, [AST.NUMBER, 10]]]
	}, {
		"input": "+10",
		"expected": [[AST.UADD, [AST.NUMBER, 10]]]
	}, {
		"input": "-30",
		"expected": [[AST.USUB, [AST.NUMBER, 30]]]
	}, {
		"input": "~false",
		"expected": [[AST.BNOT, [AST.FALSE]]]
	}, {
		"input": "!true",
		"expected": [[AST.NOT, [AST.TRUE]]]
	}, {
		"input": "delete void 10",
		"expected": [[AST.DELETE, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete typeof 10",
		"expected": [[AST.DELETE, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete ++10",
		"expected": [[AST.DELETE, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete --10",
		"expected": [[AST.DELETE, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete +10",
		"expected": [[AST.DELETE, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete -10",
		"expected": [[AST.DELETE, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete ~10",
		"expected": [[AST.DELETE, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete !10",
		"expected": [[AST.DELETE, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "delete delete 10",
		"expected": [[AST.DELETE, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "void void 10",
		"expected": [[AST.VOID, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "void typeof 10",
		"expected": [[AST.VOID, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "void ++10",
		"expected": [[AST.VOID, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "void --10",
		"expected": [[AST.VOID, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "void +10",
		"expected": [[AST.VOID, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "void -10",
		"expected": [[AST.VOID, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "void ~10",
		"expected": [[AST.VOID, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "void !10",
		"expected": [[AST.VOID, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "void delete 10",
		"expected": [[AST.VOID, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof void 10",
		"expected": [[AST.TYPEOF, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof typeof 10",
		"expected": [[AST.TYPEOF, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof ++10",
		"expected": [[AST.TYPEOF, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof --10",
		"expected": [[AST.TYPEOF, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof +10",
		"expected": [[AST.TYPEOF, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof -10",
		"expected": [[AST.TYPEOF, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof ~10",
		"expected": [[AST.TYPEOF, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof !10",
		"expected": [[AST.TYPEOF, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "typeof delete 10",
		"expected": [[AST.TYPEOF, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "++void 10",
		"expected": [[AST.UINC, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "++typeof 10",
		"expected": [[AST.UINC, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "++++10",
		"expected": [[AST.UINC, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "++--10",
		"expected": [[AST.UINC, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "+++10",
		"expected": [[AST.UINC, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "++-10",
		"expected": [[AST.UINC, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "++~10",
		"expected": [[AST.UINC, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "++!10",
		"expected": [[AST.UINC, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "++delete 10",
		"expected": [[AST.UINC, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "--void 10",
		"expected": [[AST.UDEC, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "--typeof 10",
		"expected": [[AST.UDEC, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "--++10",
		"expected": [[AST.UDEC, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "----10",
		"expected": [[AST.UDEC, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "--+10",
		"expected": [[AST.UDEC, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "---10",
		"expected": [[AST.UDEC, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "--~10",
		"expected": [[AST.UDEC, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "--!10",
		"expected": [[AST.UDEC, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "--delete 10",
		"expected": [[AST.UDEC, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "+void 10",
		"expected": [[AST.UADD, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "+typeof 10",
		"expected": [[AST.UADD, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "+++10",
		"expected": [[AST.UINC, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "+--10",
		"expected": [[AST.UADD, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "++10",
		"expected": [[AST.UINC, [AST.NUMBER, 10]]]
	}, {
		"input": "+-10",
		"expected": [[AST.UADD, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "+~10",
		"expected": [[AST.UADD, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "+!10",
		"expected": [[AST.UADD, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "+delete 10",
		"expected": [[AST.UADD, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "-void 10",
		"expected": [[AST.USUB, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "-typeof 10",
		"expected": [[AST.USUB, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "-++10",
		"expected": [[AST.USUB, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "---10",
		"expected": [[AST.UDEC, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "-+10",
		"expected": [[AST.USUB, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "--10",
		"expected": [[AST.UDEC, [AST.NUMBER, 10]]]
	}, {
		"input": "-~10",
		"expected": [[AST.USUB, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "-!10",
		"expected": [[AST.USUB, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "-delete 10",
		"expected": [[AST.USUB, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "~void 10",
		"expected": [[AST.BNOT, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "~typeof 10",
		"expected": [[AST.BNOT, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "~++10",
		"expected": [[AST.BNOT, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "~--10",
		"expected": [[AST.BNOT, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "~+10",
		"expected": [[AST.BNOT, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "~-10",
		"expected": [[AST.BNOT, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "~~10",
		"expected": [[AST.BNOT, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "~!10",
		"expected": [[AST.BNOT, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "~delete 10",
		"expected": [[AST.BNOT, [AST.DELETE, [AST.NUMBER, 10]]]]
	}, {
		"input": "!void 10",
		"expected": [[AST.NOT, [AST.VOID, [AST.NUMBER, 10]]]]
	}, {
		"input": "!typeof 10",
		"expected": [[AST.NOT, [AST.TYPEOF, [AST.NUMBER, 10]]]]
	}, {
		"input": "!++10",
		"expected": [[AST.NOT, [AST.UINC, [AST.NUMBER, 10]]]]
	}, {
		"input": "!--10",
		"expected": [[AST.NOT, [AST.UDEC, [AST.NUMBER, 10]]]]
	}, {
		"input": "!+10",
		"expected": [[AST.NOT, [AST.UADD, [AST.NUMBER, 10]]]]
	}, {
		"input": "!-10",
		"expected": [[AST.NOT, [AST.USUB, [AST.NUMBER, 10]]]]
	}, {
		"input": "!~10",
		"expected": [[AST.NOT, [AST.BNOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "!!10",
		"expected": [[AST.NOT, [AST.NOT, [AST.NUMBER, 10]]]]
	}, {
		"input": "!delete 10",
		"expected": [[AST.NOT, [AST.DELETE, [AST.NUMBER, 10]]]]
	}];

});