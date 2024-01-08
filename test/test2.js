const {describe, test, expect, beforeEach} = require('@jest/globals');
const XZInterpreter = require('../src/index.js');

describe('XZInterpreter', () => {
    let interpreter;

    beforeEach(() => {
        interpreter = new XZInterpreter();
    });

    test('run() should set running to true at start and false at end', () => {
        interpreter.run();
        expect(interpreter.running).toBe(false);
    });

    test('run() should correctly execute "start" and "over" commands', () => {
        interpreter._commands = ['start', 'over'];
        interpreter.run();
    });

    test('run() should correctly execute "log" command', () => {
        interpreter._commands = ['log &test'];
        interpreter.storages['test'] = 'Hello, world!';
        console.log = jest.fn();
        interpreter.run();
        expect(console.log).toHaveBeenCalledWith('Hello, world!');
    });

    test('run() should correctly execute "add" command', () => {
        interpreter._commands = ['add &x &y &z'];
        interpreter.storages['x'] = 5;
        interpreter.storages['y'] = 10;
        interpreter.run();
        expect(interpreter.storages['z']).toBe(15);
    });

    test('run() should correctly execute "mul" command', () => {
        interpreter._commands = ['mul &x &y &z'];
        interpreter.storages['x'] = 5;
        interpreter.storages['y'] = 10;
        interpreter.run();
        expect(interpreter.storages['z']).toBe(50);
    });

    test('run() should correctly execute "create" command', () => {
        interpreter._commands = ['create test'];
        interpreter.run();
        expect(interpreter.storages['test']).toBe(0);
    });

    test('run() should correctly execute "write" command', () => {
        interpreter._commands = ['write 100 &test'];
        interpreter.run();
        expect(interpreter.storages['test']).toBe(100);
    });
});