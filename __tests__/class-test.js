module.exports = test => {
  test(`
    class foo {
    }
  `, {
    type: 'Program',
    body: [
      {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'foo',
        },
        superClass: null,
        body: {
          type: 'BlockStatement',
          body: [],
        },
      },
    ],
  });

  test(`
    class Point {
      def constructor(x, y) {
          this.x = x;
          this.y = y;
      }
      def calc() {
          return this.x + this.y;
      }
    }
    class Point3D extends Point {
        def constructor(x, y, z) {
            super(x, y);
            this.z = z;
        }
        def calc() {
            return super() + this.z;
        }
    }
    let p = new Point3D(10, 20, 30);
    p.calc();
  `, {
    type: 'Program',
    body: [
      {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'Point',
        },
        superClass: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'FunctionDeclaration',
              name: {
                type: 'Identifier',
                name: 'constructor',
              },
              params: [
                {
                  type: 'Identifier',
                  name: 'x',
                },
                {
                  type: 'Identifier',
                  name: 'y',
                },
              ],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'AssignmentExpression',
                      operator: '=',
                      left: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                          type: 'ThisExpression',
                        },
                        property: {
                          type: 'Identifier',
                          name: 'x',
                        },
                      },
                      right: {
                        type: 'Identifier',
                        name: 'x',
                      },
                    },
                  },
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'AssignmentExpression',
                      operator: '=',
                      left: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                          type: 'ThisExpression',
                        },
                        property: {
                          type: 'Identifier',
                          name: 'y',
                        },
                      },
                      right: {
                        type: 'Identifier',
                        name: 'y',
                      },
                    },
                  },
                ],
              },
            },
            {
              type: 'FunctionDeclaration',
              name: {
                type: 'Identifier',
                name: 'calc',
              },
              params: [],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      operator: '+',
                      left: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                          type: 'ThisExpression',
                        },
                        property: {
                          type: 'Identifier',
                          name: 'x',
                        },
                      },
                      right: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                          type: 'ThisExpression',
                        },
                        property: {
                          type: 'Identifier',
                          name: 'y',
                        },
                      }
                    }
                  }
                ]
              }
            }
          ],
        },
      },
      {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'Point3D',
        },
        superClass: {
          type: 'Identifier',
          name: 'Point',
        },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'FunctionDeclaration',
              name: {
                type: 'Identifier',
                name: 'constructor',
              },
              params: [
                {
                  type: 'Identifier',
                  name: 'x',
                },
                {
                  type: 'Identifier',
                  name: 'y',
                },
                {
                  type: 'Identifier',
                  name: 'z',
                },
              ],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'CallExpression',
                      callee: {
                        type: 'Super',
                      },
                      arguments: [
                        {
                          type: 'Identifier',
                          name: 'x',
                        },
                        {
                          type: 'Identifier',
                          name: 'y',
                        },
                      ],
                    },
                  },
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'AssignmentExpression',
                      operator: '=',
                      left: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                          type: 'ThisExpression',
                        },
                        property: {
                          type: 'Identifier',
                          name: 'z',
                        },
                      },
                      right: {
                        type: 'Identifier',
                        name: 'z',
                      },
                    }
                  },
                ],
              },
            },
            {
              type: 'FunctionDeclaration',
              name: {
                type: 'Identifier',
                name: 'calc',
              },
              params: [],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      operator: '+',
                      left: {
                        type: 'CallExpression',
                        callee: {
                          type: 'Super',
                        },
                        arguments: [],
                      },
                      right: {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                          type: 'ThisExpression',
                        },
                        property: {
                          type: 'Identifier',
                          name: 'z',
                        },
                      },
                    },
                  },
                ]
              },
            },
          ],
        },
      },
      {
        type: 'VariableStatement',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'p',
            },
            init: {
              type: 'NewExpression',
              callee: {
                type: 'Identifier',
                name: 'Point3D',
              },
              arguments: [
                {
                  type: 'NumericLiteral',
                  value: 10,
                },
                {
                  type: 'NumericLiteral',
                  value: 20,
                },
                {
                  type: 'NumericLiteral',
                  value: 30,
                },
              ],
            },
          }
        ],
      },
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            computed: false,
            object: {
              type: 'Identifier',
              name: 'p',
            },
            property: {
              type: 'Identifier',
              name: 'calc',
            },
          },
          arguments: [],
        },
      },
    ],
  });
};