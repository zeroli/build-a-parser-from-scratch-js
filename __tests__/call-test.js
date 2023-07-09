module.exports = test => {
  test(`
    foo(x);
  `, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'foo',
          },
          arguments: [
            {
              type: 'Identifier',
              name: 'x',
            },
          ],
        },
      },
    ],
  });

  test(`
    foo(x)();
  `, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'foo',
            },
            arguments: [
              {
                type: 'Identifier',
                name: 'x',
              },
            ],
          },
          argument: [],
        },
      },
    ],
  });

  /*
  test(`
    foo[0](x);
  `, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            computed: true,
            object: {
              type: 'Identifier',
              name: 'foo',
            },
            property: {
              type: 'NumericLiteral',
              value: 0,
            },
          },
          arguments: [
            {
              type: 'Identifier',
              name: 'x',
            },
          ],
        },
      },
    ],
  });
  */
};
