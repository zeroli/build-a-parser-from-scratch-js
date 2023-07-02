module.exports = test => {
    test(`
        /**
         * Documentation comment:
         */
        "hello";
        // Number:
        42;
    `, {
        type: "Program",
        body: [
        {
            type: "ExpressionStatement",
            expression: {
            type: "StringLiteral",
            value: "hello",
            }
        },
        {
            type: "ExpressionStatement",
            expression: {
            type: "NumericLiteral",
            value: 42,
            },
        },
        ],
    });
};
