/**
 * Main test runner.
 */

const {Parser} = require('../src/Parser');

const parser = new Parser();

{
    console.log('parse number:');
    const program = `123`;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}
{
    console.log('parse string with double quote:');
    const program = `"123"`;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}
{
    console.log('parse string with single quote:');
    const program = `'123'`;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

{
    console.log('parse number with whitespaces:');
    const program = `  123   `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

{
    console.log('parse string with single quote and whitspaces inside:');
    const program = `   '  123   '   `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

{
    console.log('parse number with single line comment:');
    const program = `
        // this is a comment
        123
    `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

{
    console.log('parse number with multi-line comment:');
    const program = `
        /**
         * this is multi-line comment
        */
        123
    `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}
