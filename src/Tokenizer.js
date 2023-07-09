/**
 * Tokenize spec. Order matters!
 */
const Spec = [
    // whitespaces
    [/^\s+/, null],

    // single line comment: // xxxx
    [/^\/\/.*/, null],
    // multi-line comment:  /* xxxx */
    [/^\/\*[\s\S]*?\*\//, null],

    // Symbols, delimiters:
    [/^;/, ';'],
    [/^{/, '{'],
    [/^}/, '}'],
    [/^\(/, '('],
    [/^\)/, ')'],
    [/^,/,  ','], // comma
    [/^\./, '.'], // dot
    [/^\[/, '['], // [
    [/^\]/, ']'], // ]

    // keywords
    [/^\blet\b/, 'let'],
    [/^\bif\b/, 'if'],
    [/^\belse\b/, 'else'],

    [/^\btrue\b/, 'true'],
    [/^\bfalse\b/, 'false'],
    [/^\bnull\b/, 'null'],
    [/^\bwhile\b/, 'while'],
    [/^\bdo\b/, 'do'],
    [/^\bfor\b/, 'for'],
    [/^\bdef\b/, 'def'],
    [/^\breturn\b/, 'return'],

    [/^\bclass\b/, 'class'],
    [/^\bextends\b/, 'extends'],
    [/^\bsuper\b/, 'super'],
    [/^\bnew\b/, 'new'],
    [/^\bthis\b/, 'this'],

    // Number
    [/^\d+/, 'NUMBER'],

    // Identifiers:
    [/^\w+/, 'IDENTIFIER'],

    // before assignment operators
    [/^[=!]=/, 'EQUALITY_OPERATOR'],

    // Assignment operators: =, *=, /=, +=, -=
    [/^=/, 'SIMPLE_ASSIGN'],
    [/^[*\/+-]=/, 'COMPLEX_ASSIGN'],

    // math operators: +, -, *, /
    [/^[+-]/, 'ADDITIVE_OPERATOR'],
    [/^[*/]/, 'MULTIPLICATIVE_OPERATOR'],

    // relational operators: >, >=, <, <=
    [/^[><]=?/, 'RELATIONAL_OPERATOR'],

    // logical operators: &&, ||
    [/^&&/, 'LOGICAL_AND'],
    [/^\|\|/, 'LOGICAL_OR'],
    [/^!/, 'LOGICAL_NOT'],

    // String
    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],
]
/**
 * Tokenizer class.
 * Lazily pulls a token from a stream.
 */

class Tokenizer {
    /**
     * Initializes the string
     */
    init(string) {
        this._string = string;
        this._cursor = 0;
    }

    /**
     * whether this tokenizer reached EOF.
     */
    isEOF() {
        return this._cursor == this._string.length;
    }

    /**
     * check if input has more token
     */
    hasMoreTokens() {
        return this._cursor < this._string.length;
    }

    /**
     * Obtains next token
     */
    getNextToken() {
        if (!this.hasMoreTokens()) {
            return null;
        }
        const string = this._string.slice(this._cursor);
        for (const [regexp, tokenType] of Spec) {
            const tokenValue = this._match(regexp, string);

            if (tokenValue == null) {
                continue;
            }
            // e.g. whitespace
            if (tokenType == null) {
                return this.getNextToken();
            }

            return {
                type: tokenType,
                value: tokenValue,
            };
        }

        throw new SyntaxError(
            `Unknown token: "${string[0]}"`
        );
    }

    /**
     *
     */
    _match(regexp, string) {
        const matched = regexp.exec(string);
        if (matched !== null) {
            this._cursor += matched[0].length;
            return matched[0];
        }
        return null;
    }
}

module.exports = {
    Tokenizer,
};
