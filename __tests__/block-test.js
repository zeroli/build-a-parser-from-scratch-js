module.exports = test => {
    test(`
    {
        42;
        "hello";
    }
    `, {
        type: 'Program',
        body: [
            {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'NumericLiteral',
                            value: 42,
                        },
                    },
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'StringLiteral',
                            value: "hello",
                        },
                    },
                ],
            },
        ],
    });
    test(`
    {  // nested block
        42;
        {
            "hello";
        }
    }
    `, {
        type: 'Program',
        body: [
            {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'NumericLiteral',
                            value: 42,
                        },
                    },
                    {
                        type: 'BlockStatement',
                        body: [
                            {
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'StringLiteral',
                                    value: "hello",
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    });
    test(`
    {
        // empty block
    }
    `, {
        type: 'Program',
        body: [
            {
                type: 'BlockStatement',
                body: [],
            },
        ],
    });
};
