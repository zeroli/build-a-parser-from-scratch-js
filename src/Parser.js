/**
 * Letter parser: recursive descent implementation.
 */

class Parser {
    /**
     * Parse a string into an AST
     */
    parse(string) {
        this._string = string;
        return this.Program();
    }

    /**
     * Main entry point
     * Program
     *      : NumericLiteral
     *      ;
     */
    Program() {
        return this.NumericLiteral();
    }

    /**
     * NumericLiteral
     *      : NUMBER
     *      ;
     */
    NumericLiteral() {
        return {
            type: 'NumericLiteral',
            value: Number(this._string),
        };
    }
}

module.exports = {
    Parser,
};
