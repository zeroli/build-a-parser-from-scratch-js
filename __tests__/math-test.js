module.exports = test => {
  // Addition
  test(`2 + 2;`, {
    type: 'Program',
    body: [
      {
        type:'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: {
            type: 'NumericLiteral',
            value: 2,
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ]
  });
  // Nested binary expression
  test(`3 + 2 - 2;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'NumericLiteral',
              value: 3,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
          right: {
            type: 'NumericLiteral',
            value: 2,
          },
        },
      },
    ],
  });
  test(`1 * 2 / 3;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '/',
          left: {
            type: 'BinaryExpression',
            operator: '*',
            left: {
              type: 'NumericLiteral',
              value: 1,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
          right: {
            type: 'NumericLiteral',
            value: 3,
          },
        },
      },
    ],
  });
  // precedence of operations
  test(`2 + 2 * 3;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '+',
          left: {
            type: 'NumericLiteral',
            value: 2,
          },
          right: {
            type: 'BinaryExpression',
            operator: '*',
            left: {
              type: 'NumericLiteral',
              value: 2,
            },
            right: {
              type: 'NumericLiteral',
              value: 3,
            },
          },
        },
      },
    ],
  });

  test(`(1+2) * (3-4);`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '*',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'NumericLiteral',
              value: 1,
            },
            right: {
              type: 'NumericLiteral',
              value: 2,
            },
          },
          right: {
            type: 'BinaryExpression',
            operator: '-',
            left: {
              type: 'NumericLiteral',
              value: 3,
            },
            right: {
              type: 'NumericLiteral',
              value: 4,
            }
          },
        },
      },
    ],
  });

  test(`1- ((1+3) * 4);`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '-',
          left: {
            type: 'NumericLiteral',
            value: 1,
          },
          right: {
            type: 'BinaryExpression',
            operator: '*',
            left: {
              type: 'BinaryExpression',
              operator: '+',
              left: {
                type: 'NumericLiteral',
                value: 1,
              },
              right: {
                type: 'NumericLiteral',
                value: 3,
              },
            },
            right: {
              type: 'NumericLiteral',
              value: 4,
            },
          },
        },
      },
    ],
  });
};