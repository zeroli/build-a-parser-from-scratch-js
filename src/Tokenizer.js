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
        // Numbers
        if (!Number.isNaN(Number(string[0]))) {
            let number= '';
            while (!Number.isNaN(Number(string[this._cursor]))) {
                number += string[this._cursor++];
            }
            return {
                type: 'NUMBER',
                value: number,
            };
        }

        // Strings
        if (string[0] == '"') {
            let s = '';
            do {
                s += string[this._cursor++];
            } while (string[this._cursor] !== '"' && !this.isEOF());
            s += string[this._cursor++];  // skip "
            return {
                type: 'STRING',
                value: s,
            };
        }
        if (string[0] == "'") {
            let s = '';
            do {
                s += string[this._cursor++];
            } while (string[this._cursor] !== "'" && !this.isEOF());
            s += string[this._cursor++];  // skip '
            return {
                type: 'STRING',
                value: s,
            };
        }
        throw new SyntaxError(
            `Unknown token: "${string[0]}"`,
        );
    }
}

module.exports = {
    Tokenizer,
};
