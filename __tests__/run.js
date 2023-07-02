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
];

const parser = new Parser();

function exec() {
    console.log('manual parsing:');
    const program = `
        /**
         * Documentation comment:
         */
        "hello";
        // Number:
        42;
    `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

// test function
function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

//exec();

// run all tests
tests.forEach(testRun => testRun(test));

console.log("all test passed");
