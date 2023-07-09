/**
 * Letter parser: recursive descent implementation.
 */

const {Tokenizer} = require('./Tokenizer');

// Default AST node factories
const DefaultFactory = {
    Program(body) {
        return {
            type: 'Program',
            body,
        };
    },
    EmptyStatement() {
        return {
            type: 'EmptyStatement',
        };
    },
    BlockStatement(body) {
        return {
            type: 'BlockStatement',
            body,
        };
    },
    ExpressionStatement(expression) {
        return {
            type: 'ExpressionStatement',
            expression,
        };
    },
    StringLiteral(value) {
        return {
            type: 'StringLiteral',
            value,
        };
    },
    NumericLiteral(value) {
        return {
            type: 'NumericLiteral',
            value,
        };
    },
};

// S-expression AST node factories
const SExpressionFactory = {
    Program(body) {
        return ['begin', body];
    },
    EmptyStatement() { },
    BlockStatement(body) {
        return ['begin', body];
    },
    ExpressionStatement(expression) {
        return expression;
    },
    StringLiteral(value) {
        return `${value}`;
    },
    NumericLiteral(value) {
        return value;
    },
};

const ASTMode = 'default';
const factory = ASTMode === 'default' ? DefaultFactory : SExpressionFactory;

class Parser {
    /**
     * Initializes the parser.
     */
    constructor() {
        this._string = '';
        this._tokenizer = new Tokenizer();
    }

    /**
     * Parse a string into an AST
     */
    parse(string) {
        this._string = string;
        this._tokenizer.init(string);

        this._lookahead = this._tokenizer.getNextToken();

        return this.Program();
    }

    /**
     * Main entry point
     * Program
     *      : StatementList
     *      ;
     */
    Program() {
        return factory.Program(this.StatementList());
    }

    /**
     * StatementList
     *      : Statement
     *      | Statement StatementList
     */
    StatementList(stopLookahead = null) {
        const statementList = [this.Statement()];
        while (this._lookahead !== null &&
            this._lookahead.type !== stopLookahead) {
            statementList.push(this.Statement());
        }
        return statementList;
    }

    /**
     * Statement
     *      : ExpressionStatement
     *      | BlockStatement
     *      | EmptyStatement
     *      | VariableStatement
     *      | IfStatement
     *      | IterationStatement
     *      ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case ';':
                return this.EmptyStatement();
            case '{':
                return this.BlockStatement();
            case 'let':
                return this.VariableStatement();
            case 'if':
                return this.IfStatement();
            case 'while':
            case 'do':
            case 'for':
                return this.IterationStatement();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     * IterationStatement
     *      : WhileStatement
     *      | DoWhileStatement
     *      | ForStatement
     *      ;
     */
    IterationStatement() {
        switch (this._lookahead.type) {
            case 'while':
                return this.WhileStatement();
            case 'do':
                return this.DoWhileStatement();
            case 'for':
                return this.ForStatement();
        }
    }

    /**
     * WhileStatement
     *      : 'while' '(' Expression ')' Statement
     *      ;
     */
    WhileStatement() {
        this._eat('while');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');
        const body = this.Statement();
        return {
            type: 'WhileStatement',
            test,
            body,
        };
    }

    /**
     * DoWhileStatement
     *      : 'do' Statement 'while' '(' Expression ')' ';'
     *      ;
     */
    DoWhileStatement() {
        this._eat('do');
        const body = this.Statement();
        this._eat('while');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');
        this._eat(';');
        return {
            type: 'DoWhileStatement',
            body,
            test,
        };
    }

    /**
     * IfStatement
     *      : 'if' '(' Expression ')' Statement
     *      | 'if' '(' Expression ')' Statement 'else' Statement
     *      ;
     **/
    IfStatement() {
        this._eat('if');
        this._eat('(');
        const test = this.Expression();
        this._eat(')');

        const consequent = this.Statement();
        const alternate =
            this._lookahead !== null && this._lookahead.type === 'else'
                ? this._eat('else') && this.Statement()
                : null;
        return {
            type: 'IfStatement',
            test,
            consequent,
            alternate,
        };
    }

    /**
     * ForStatement
     *      : 'for' '(' OptForStatementInit ';' OptExpression ';' OptExpression ')' Statement
     *      ;
     */
    ForStatement() {
        this._eat('for');
        this._eat('(');
        let init;
        if (this._lookahead.type !== ';') {
            init = this.OptForStatementInit();
        }
        this._eat(';');

        let test;
        if (this._lookahead.type !== ';') {
            test = this.Expression();
        }
        this._eat(';');

        let update;
        if (this._lookahead.type !== ')') {
            update = this.Expression();
        }
        this._eat(')');

        const body = this.Statement();
        return {
            type: 'ForStatement',
            init,
            test,
            update,
            body,
        };
    }

    /**
     * OptForStatementInit
     *      : VariableStatementInit
     *      | Expression
     *      ;
     */
    OptForStatementInit() {
        if (this._lookahead.type === 'let') {
            return this.VariableStatementInit();
        }
        return this.Expression();
    }

    /**
     * VariableStatementInit
     *      : 'let' VariableDeclarationList
     *      ;
     */
    VariableStatementInit() {
        this._eat('let');
        const declarations = this.VariableDeclarationList();
        return {
            type: 'VariableStatement',
            declarations,
        };
    }

    /**
     * VariableStatement
     *      : 'let' VariableDeclarationList ';'
     *      ;
     */
    VariableStatement() {
        const variableStatement = this.VariableStatementInit();
        this._eat(';');
        return variableStatement;
    }

    /**
     * VariableDeclarationList
     *      : VariableDeclaration
     *      | VariableDeclarationList ',' VaraibleDeclaration
     */
    VariableDeclarationList() {
        const declarations = [];
        do {
            declarations.push(this.VariableDeclaration());
        } while (this._lookahead.type == ',' && this._eat(','));

        return declarations;
    }

    /**
     * VariableDeclaration
     *      : Identifier OptVariableInitializer
     *      ;
     */
    VariableDeclaration() {
        const id = this.Identifier();

        // OptVariableInitializer (`let x = 42;`)
        const init =
            this._lookahead.type !== ';' && this._lookahead.type !== ','
                ? this.VariableInitializer()
                : null;
        return {
            type: 'VariableDeclaration',
            id,
            init,
        };
    }

    /**
     * VariableInitializer
     *      : SIMPLE_ASSIGN AssignmentExpression
     *      ;
     */
    VariableInitializer() {
        this._eat('SIMPLE_ASSIGN');  // '='
        return this.AssignmentExpression();
    }

    /**
     * EmptyStatement
     *      : ';'
     *      ;
     */
    EmptyStatement() {
        this._eat(';');
        return factory.EmptyStatement();
    }
    /**
     * BlockStatement
     *      : '{' OptStatementList '}'
     *      ;
     */
    BlockStatement() {
        this._eat('{');
        // since StatementList will parse until the end of input
        // so we need ask it to stop at '}'
        const body = this._lookahead.type !== '}'
            ? this.StatementList('}')
            : [];
        this._eat('}');
        return factory.BlockStatement(body);
    }

    /**
     * ExpressionStatment
     *      : Expression ';'
     *      ;
     */
    ExpressionStatement() {
        const expression = this.Expression();
        this._eat(';');
        return factory.ExpressionStatement(expression);
    }

    /**
     * Expression
     *      : AssignmentExpression
     *      ;
     */
    Expression() {
        return this.AssignmentExpression();
    }

    /**
     * AssignmentExpression
     *      : LogicalORExpression
     *      | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *      ;
     */
    AssignmentExpression() {
        const left = this.LogicalORExpression();

        if (!this._isAssignmentOperator(this._lookahead.type)) {
            return left;
        }

        return {
            type: 'AssignmentExpression',
            operator: this.AssignmentOperator().value,
            left: this._checkValidAssignmentTarget(left),
            right: this.AssignmentExpression(),
        };
    }

    /**
     * Logical OR expression (precedenc lower than logical AND)
     *      x || y
     *
     * LogicalORExpression
     *      : LogicalANDExpression
     *      | LogicalORExpression LOGICAL_OR LogicalANDExpression
     *      ;
     */
    LogicalORExpression() {
        return this._LogicalExpression('LogicalANDExpression', 'LOGICAL_OR');
    }

    /**
     * Logical AND expression
     *      x && y
     *
     * LogicalANDExpression
     *      : EqualityExpression
     *      | LogicalANDExpression LOGICAL_AND EqualityExpression
     *      ;
     */
    LogicalANDExpression() {
        return this._LogicalExpression('EqualityExpression', 'LOGICAL_AND');
    }

    /**
     * Generic helper for LogicalExpression node
     */
    _LogicalExpression(buildName, operatorToken) {
        let left = this[buildName]();

        while (this._lookahead.type == operatorToken) {
            const operator = this._eat(operatorToken).value;
            const right = this[buildName]();
            left = {
                type: 'LogicalExpression',
                operator,
                left,
                right,
            };
        }
        return left;
    }

    /**
     * EQUALITY_OPERTORS: ==, !=
     * x == y
     * x != y
     *
     * EqualityExpression
     *      : RelationalExpression
     *      | EqualityExpression EQUALITY_OPERATOR RelationalExpression
     *      ;
     */
    EqualityExpression() {
        return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
    }

    /**
     * RELATIONAL_OPERATOR: >, >=, <, <=
     *  x > y
     *  x >= y
     *  x < y
     *  x <= y
     *
     * RelationalExpression
     *      : AdditiveExpression
     *      | RelationalExpression RELATIONAL_OPERATOR AdditiveExpression
     *      ;
     */
    RelationalExpression() {
        return this._BinaryExpression('AdditiveExpression', 'RELATIONAL_OPERATOR');
    }

    /**
     * AssignmentOperator
     *      : SIMPLE_ASSIGN
     *      | COMPLEX_ASSIGN
     *      ;
     */
    AssignmentOperator() {
        if (this._lookahead.type === 'SIMPLE_ASSIGN') {
            return this._eat('SIMPLE_ASSIGN');
        }
        return this._eat('COMPLEX_ASSIGN');
    }

    /**
     * LeftHandSideExpression
     *      : Identifier
     *      ;
     */
    LeftHandSideExpression() {
        return this.Identifier();
    }

    /**
     * Identifier
     *      : IDENTIFIER
     *      ;
     */
    Identifier() {
        const name = this._eat('IDENTIFIER').value;
        return {
            type: 'Identifier',
            name,
        };
    }

    /**
     * Extra check whether it's valid assignment target
     */
    _checkValidAssignmentTarget(node) {
        if (node.type === 'Identifier') {
            return node;
        }
        throw new SyntaxError('Invalid left-hand side in assignment expression');
    }

    /**
     *
     */
    _isAssignmentOperator(opType) {
        return opType === 'SIMPLE_ASSIGN' ||
            opType === 'COMPLEX_ASSIGN';
    }

    /**
     * AdditiveExpression
     *      : MultiplicativeExpression
     *      | AdditiveExpression ADDITIVE_OPERATOR MultiplicativeExpression
     *      ;
     */
    AdditiveExpression() {
        return this._BinaryExpression(
            'MultiplicativeExpression',
            'ADDITIVE_OPERATOR'
        );
    }
    /**
     * MultiplicativeExpression
     *      : PrimaryExpression
     *      | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression
     *      ;
     */
    MultiplicativeExpression() {
        return this._BinaryExpression(
            'PrimaryExpression',
            'MULTIPLICATIVE_OPERATOR'
        );
    }

    _BinaryExpression(buildName, operatorToken) {
        let left = this[buildName]();

        while (this._lookahead.type === operatorToken) {
            const operator = this._eat(operatorToken).value;
            const right = this[buildName]();
            left = {
                type: 'BinaryExpression',
                operator,
                left,
                right,
            };
        }

        return left;
    }

    /**
     * PrimaryExpression
     *      : Literal
     *      | UnaryExpression
     *      | ParenthesizedExpression
     *      | LeftHandSideExpression
     *      ;
     */
    PrimaryExpression() {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal();
        }
        if (this._isUnaryOperator(this._lookahead.type)) {
            return this.UnaryExpression();
        }
        switch (this._lookahead.type) {
            case '(':
                return this.ParenthesizedExpression();
            default:
                return this.LeftHandSideExpression();
        }
    }

    /**
     * Whether the token is unary oeprator
     */
    _isUnaryOperator(tokenType) {
        return tokenType === 'ADDITIVE_OPERATOR' ||
            tokenType == 'LOGICAL_NOT';
    }

    /**
     * UnaryExpression
     *      : '-' Expression
     *      | '!' Expression
     *      ;
     */
    UnaryExpression() {
        let operator;
        switch (this._lookahead.type) {
            case 'ADDITIVE_OPERATOR':
                operator = this._eat('ADDITIVE_OPERATOR').value;
                break;
            case 'LOGICAL_NOT':
                operator = this._eat('LOGICAL_NOT').value;
                break;
        }
        if (operator != null) {
            return {
                type: 'UnaryExpression',
                operator,
                argument: this.Expression(),
            };
        }
    }

    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
        return tokenType === 'NUMBER' || tokenType === 'STRING' ||
            tokenType === 'true' || tokenType === 'false' ||
            tokenType === 'null';
    }

    /**
     * ParenthesizedExpression
     *      : '(' Expression ')'
     *      ;
     *
     */
    ParenthesizedExpression() {
        this._eat('(');
        const expression = this.Expression();
        this._eat(')');
        return expression;
    }

    /**
     * Literal
     *      : NumberLiteral
     *      | StringLiteral
     *      | BooleanLiteral
     *      | NullLiteral
     *      ;
     */
    Literal() {
        switch (this._lookahead.type) {
            case 'NUMBER':
                return this.NumericLiteral();
            case 'STRING':
                return this.StringLiteral();
            case 'true':
                return this.BooleanLiteral(true);
            case 'false':
                return this.BooleanLiteral(false);
            case 'null':
                return this.NullLiteral();
        };
    }

    /**
     * StringLiteral
     *      : STRING
     *      ;
     */
    StringLiteral() {
        const token = this._eat('STRING');
        return factory.StringLiteral(token.value.slice(1, -1));
    }

    /**
     * NumericLiteral
     *      : NUMBER
     *      ;
     */
    NumericLiteral() {
        const token = this._eat('NUMBER');
        return factory.NumericLiteral(Number(token.value));
    }

    /**
     * BooleanLiteral
     *      : 'true'
     *      | 'false'
     *      ;
     */
    BooleanLiteral(value) {
        this._eat(value ? 'true' : 'false');
        return {
            type: 'BooleanLiteral',
            value,
        };
    }
    /**
     * NullLiteral
     *      : 'null'
     */
    NullLiteral() {
        this._eat('null');
        return {
            type: 'NullLiteral',
        };
    }

    /**
     * Expects a token of a given type
     */
    _eat(tokenType) {
        const token = this._lookahead;
        if (token === null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}"`,
            );
        }
        if (token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`,
            );
        }

        // advance to next token
        this._lookahead = this._tokenizer.getNextToken();
        return token;
    }
}

module.exports = {
    Parser,
};
