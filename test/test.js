define([
	'../src/Constants',
	'PrimaryExpression',
	'PostfixExpression',
	'MultiplicativeExpression',
	'AdditiveExpression',
	'UnaryExpression',
	'RelationalExpression',
	'EqualityExpression'
], function(
	AST,
	PrimaryExpression,
	PostfixExpression,
	MultiplicativeExpression,
	AdditiveExpression,
	UnaryExpression,
	RelationalExpression,
	EqualityExpression
) {

	return []

	.concat(PrimaryExpression)
	.concat(PostfixExpression)
	.concat(MultiplicativeExpression)
	.concat(AdditiveExpression)
	.concat(UnaryExpression)
	.concat(RelationalExpression)
	.concat(EqualityExpression)

	;

});