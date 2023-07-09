/**
 * Main test runner.
 */

const {Parser} = require('../src/Parser');
const assert = require('assert');

/**
 * list of tests
 */
const tests = [
    require('./literals-test.js'),
    require('./statement-list-test.js'),
    require('./block-test.js'),
    require('./empty-statement-test.js'),
    require('./math-test.js'),
    require('./assignment-test.js'),
    require('./variable-test.js'),
    require('./if-test.js'),
    require('./relational-test.js'),
];

const parser = new Parser();

function exec() {
    console.log('manual parsing:');
    const program = `
        x + 5 > 10;
        x > 10 < 1;
    `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

// test function
function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

exec();

// run all tests
tests.forEach(testRun => testRun(test));

console.log("all test passed");
