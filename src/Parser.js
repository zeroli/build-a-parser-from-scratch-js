/**
 * Letter parser: recursive descent implementation.
 */

const {Tokenizer} = require('./Tokenizer');

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
        return {
            type: 'Program',
            body: this.StatementList(),
        };
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
     *      ;
     */
    Statement() {
        switch (this._lookahead.type) {
            case ';':
                return this.EmptyStatement();
            case '{':
                return this.BlockStatement();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     * EmptyStatement
     *      : ';'
     *      ;
     */
    EmptyStatement() {
        this._eat(';');
        return {
            type: 'EmptyStatement',
        };
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
        return {
            type: 'BlockStatement',
            body,
        };
    }

    /**
     * ExpressionStatment
     *      : Expression ';'
     *      ;
     */
    ExpressionStatement() {
        const expression = this.Expression();
        this._eat(';');
        return {
            type: 'ExpressionStatement',
            expression,
        }
    }

    /**
     * Expression
     *      : Literal
     *      ;
     */
    Expression() {
        return this.Literal();
    }

    /**
     * Literal
     *      : NumberLiteral
     *      | StringLiteral
     *      ;
     */
    Literal() {
        switch (this._lookahead.type) {
            case 'NUMBER':
                return this.NumericLiteral();
            case 'STRING':
                return this.StringLiteral();
        };
    }

    /**
     * StringLiteral
     *      : STRING
     *      ;
     */
    StringLiteral() {
        const token = this._eat('STRING');
        return {
            type: 'StringLiteral',
            value: token.value.slice(1, -1),
        };
    }

    /**
     * NumericLiteral
     *      : NUMBER
     *      ;
     */
    NumericLiteral() {
        const token = this._eat('NUMBER');
        return {
            type: 'NumericLiteral',
            value: Number(token.value),
        };
    }

    /**
     * Expects a token of a given type
     */
    _eat(tokenType) {
        const token = this._lookahead;
        if (token == null) {
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
