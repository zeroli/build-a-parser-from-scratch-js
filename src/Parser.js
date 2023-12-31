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
        const statementList = [];
        if (this._lookahead === null) {
            return statementList;
        }
        statementList.push(this.Statement());
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
     *      | FunctionDeclaration
     *      | ClassDeclaration
     *      | ReturnStatement
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
            case 'def':
                return this.FunctionDeclaration();
            case 'class':
                return this.ClassDeclaration();
            case 'return':
                return this.ReturnStatement();
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
     * ClassDeclaration
     *      : 'class' Identifier OptClassExtends BlockStatement
     *      ;
     */
    ClassDeclaration() {
        this._eat('class');
        const id = this.Identifier();
        const superClass =
            this._lookahead.type === 'extends'
                ? this.ClassExtends()
                : null;

        const body = this.BlockStatement();
        return {
            type: 'ClassDeclaration',
            superClass,
            id,
            body,
        };
    }

    /**
     * ClassExtends
     *      : 'extends' Identifier
     *      ;
     *
     */
    ClassExtends() {
        this._eat('extends');
        return this.Identifier();
    }

    /**
     * FunctionDeclaration
     *      : 'def' Identifier '(' OptFormalParameterList ')' BlockStatement
     *      ;
     */
    FunctionDeclaration() {
        this._eat('def');
        const name = this.Identifier();
        this._eat('(');
        let params = [];
        if (this._lookahead.type !== ')') {
            params = this.OptFormalParameterList();
        }
        this._eat(')');
        const body = this.BlockStatement();

        return {
            type: 'FunctionDeclaration',
            name,
            params,
            body,
        };
    }

    /**
     * OptFormalParameterList
     *      : Identifier
     *      | OptFormalParameterList ',' Identifier
     *      ;
     */
    OptFormalParameterList() {
        let params = [this.Identifier()];
        while (this._lookahead.type === ',') {
            this._eat(',');
            params.push(this.Identifier());
        }
        return params;
    }

    /**
     * ReturnStatement
     *      : 'return' ';'
     *      | 'return' Expression ';'
     *      ;
     */
    ReturnStatement() {
        this._eat('return');
        const argument = this._lookahead.type !== ';'
            ? this.Expression() : null;
        this._eat(';');

        return {
            type: 'ReturnStatement',
            argument,
        };
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
     *      : CallMemberExpression
     *      ;
     */
    LeftHandSideExpression() {
        return this.CallMemberExpression();
    }

    /**
     * CallMemberExpression
     *      : MemberExpression
     *      | CallExpression
     *      ;
     */
    CallMemberExpression() {
        // Super call:
        if (this._lookahead.type === 'super') {
            return this._CallExpression(this.Super());
        }

        // Member part, might be part of a call
        const member = this.MemberExpression();

        // See if we have a call expression
        if (this._lookahead.type === '(') {
            return this._CallExpression(member);
        }
        return member;
    }

    /**
     * Super
     *      : 'super'
     *      ;
     */
    Super() {
        this._eat('super');
        return {
            type: 'Super',
        };
    }

    /**
     * Generic call expression helper
     *
     * CallExpression
     *      : Callee Arguments
     *
     * Callee
     *      : MemberExpression
     *      | CallExpression
     *      ;
     */
    _CallExpression(callee) {
        let callExpression = {
            type: 'CallExpression',
            callee,
            arguments: this.Arguments(),
        };
        if (this._lookahead.type === '(') {
            callExpression = this._CallExpression(callExpression);
        }
        return callExpression;
    }

    /**
     * MemberExpression
     *      : PrimaryExpression
     *      | MemberExpression ',' Identifier
     *      | MemberExpression '[' Expression ']'
     *      ;
     *
     */
    MemberExpression() {
        let object = this.PrimaryExpression();
        while (this._lookahead.type === '.' ||
             this._lookahead.type === '[') {
            if (this._lookahead.type === '.') {
                this._eat('.');
                const property = this.Identifier();
                object = {
                    type: 'MemberExpression',
                    computed: false,
                    object,
                    property,
                };
            }
            if (this._lookahead.type === '[') {
                this._eat('[');
                const property = this.Expression();
                this._eat(']');
                object = {
                    type: 'MemberExpression',
                    computed: true,
                    object,
                    property,
                };
            }
        }
        return object;
    }

    /**
     * Arguments
     *      : '(' OptCallArgumentList ')'
     *      ;
     */
    Arguments() {
        this._eat('(');
        const args = this._lookahead.type !== ')'
            ? this.OptCallArgumentList() : [];
        this._eat(')');
        return args;
    }

    /**
     * OptCallArgumentList
     *      : Expression
     *      | OptCallArgumentList ',' Expression
     *      ;
     */
    OptCallArgumentList() {
        let args = [];
        do {
            args.push(this.Expression());
        } while (this._lookahead.type == ',' && this._eat(','));
        return args;
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
        if (node.type === 'Identifier' || node.type === 'MemberExpression') {
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
            'UnaryExpression',
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
     *      | ParenthesizedExpression
     *      | ThisExpression
     *      | NewExpression
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
            case 'IDENTIFIER':
                return this.Identifier();
            case 'this':
                return this.ThisExpression();
            case 'new':
                return this.NewExpression();
            default:
                throw new SyntaxError(`Unexpected promary expression.`);
        }
    }

    /**
     * ThisExpression
     *      : 'this' '.'
     */
    ThisExpression() {
        this._eat('this');
        return {
            type: 'ThisExpression',
        };
    }

    /**
     * NewExpression
     *      : 'new' MemberExpression Arguments
     *      ;
     */
    NewExpression() {
        this._eat('new');
        return {
            type: 'NewExpression',
            callee: this.MemberExpression(),
            arguments: this.Arguments(),
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
     *      : LeftHandSideExpression
     *      | '-' Expression
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
        return this.LeftHandSideExpression();
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
