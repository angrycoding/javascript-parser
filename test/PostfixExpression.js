define('../src/Constants', function(AST) {

	return [{
		"input": "null++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "this++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "true++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "false++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32e3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32e3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32e3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32e+3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32e+3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32e+3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32e-3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32e-3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32e-3++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0xBABE++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "'string'++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "(123)++",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "null--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "this--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "true--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "false--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32e3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32e3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32e3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32e+3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32e+3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32e+3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "32e-3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": ".32e-3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0.32e-3--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "0xBABE--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "'string'--",
		"exception": {"code": "bad_lhs_postfix"}
	}, {
		"input": "(123)--",
		"exception": {"code": "bad_lhs_postfix"}
	}];

});