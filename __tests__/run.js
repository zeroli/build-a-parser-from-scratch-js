/**
 * Main test runner.
 */

const {Parser} = require('../src/Parser');
const assert = require('assert');

/**
 * list of tests
 */
const tests = [require('./literals_test.js')];

const parser = new Parser();

function exec() {
    console.log('parse number:');
    const program = `123`;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

// test function
function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

// run all tests
tests.forEach(testRun => testRun(test));

console.log("all test passed");
