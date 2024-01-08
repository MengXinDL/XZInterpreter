const Errors = require('./error.js');
const commands = require('./command.js');
class XZ {
    static create() {
        return new XZ();
    }

    static argumentType = {
        STORAGE: 0,
        NAME: 1,
        NUMBER: 2,
        INVALID: 3
    }

    constructor(c = false) {
        this._commands = [];
        this.c = c;
        this.storages = {};
        this.running = false;
        this.drg = 0;
    }
    /**
     * @param {string} value
     */
    setCommand(value) {
        if (!this.running) {
            for (const l of value.split('\n')) {
                if (l.replace(/\s/g, '') == '') continue;
                this._commands.push(l);
            }
        }
    }
    get command() {
        let o = '', s = 0;
        for (const cmd of this._commands) {
            if (cmd == 'over') s--;
            o += '  '.repeat(s);
            o = o + cmd;
            o += '\n';
            if (cmd == 'start') s++;
        }
        return o;
    }

    run() {
        this.running = true;
        let sl = [];
        let line = 0
        /**@param {string} str  */
        function judgeArg(str) {
            if (str.startsWith('&')) {
                str = str.slice(1);
                if (/[^a-zA-Z]/g.test(str)) return XZ.argumentType.NAME;
                else return XZ.argumentType.STORAGE;
            }
            else if (/^[-+]?\d+(\.\d+)?$/.test(str)) return XZ.argumentType.NUMBER;
            return XZ.argumentType.INVALID;

        }
        /**@param {string} str  */
        let getstorage = (str) => {
            if (str == '&') return this.drg;
            if (str.startsWith("&")) return this.storages[str.slice(1)];
            else return parseFloat(str);
        }
        /**
         * @param {XZ.argumentType[][]} expected 
         * @param {any[]} args 
         * @returns
         */
        function expectedTypeArgs(expected, args) {
            return args.every((v, i) => expected[i] === undefined || expected[i].includes(judgeArg(v)));
        }
        /**
         * @param {number} expectedArgs 期望的参数数量
         * @param {any[]} actualArgs 实际的参数数组
         * @param {boolean} allowLess 是否允许参数数量少于 expectedArgs
         * @returns {boolean}
         */
        function validateArgumentCount(expectedArgs, actualArgs, allowLess = false) {
            if (actualArgs.length < expectedArgs + 1 && !(allowLess && actualArgs.length == expectedArgs)) {
                console.warn(
                    Errors.InvalidArgumentError,
                    `: Expected ${expectedArgs} argument but found ${actualArgs.length - 1} at line ` + (line + 1)
                );
                return true;
            }
            return false;
        }
        for (line = 0; line != this._commands.length; line++) {
            let args = this._commands[line].split(' ');
            let trackError = (type, message) => {
                console.warn(type, ': ' + message + ' at line ' + (line + 1) + `: ${this._commands[line]}`);
            }
            if (!commands.includes(args[0])) {
                trackError(Errors.InvalidCommandError, 'the command does not exist');
                line++; continue;
            }
            switch (args[0]) {
                case 'start':
                    sl.push(line);
                    break;
                case 'over':
                    if (sl.length == 0) {
                        trackError(Errors.InvalidCommandError, 'an "over" command with no "start"');
                        break;
                    }
                    let p = sl.pop();
                    if (p > 0 && this._commands[p - 1].startsWith("loop"))
                        line = p - 2;
                    break;
                case 'log':
                    console.log(...args.slice(1).map((value) => {
                        if (value == '&') return this.drg;
                        if (judgeArg(value) == 0) return this.storages[value.slice(1)];
                        return value.replace(/\\\\/g, '\\').replace(/\\&/, '&');
                    }));
                    break;
                case 'add':
                    if (validateArgumentCount(3, args, true)) break;
                    if (!expectedTypeArgs(new Array(2).fill([XZ.argumentType.STORAGE, XZ.argumentType.NUMBER]), args.slice(1)) || (args.length == 4 && judgeArg(args[3]))) {
                        trackError(Errors.InvalidArgumentError, 'invalid argument');
                        break;
                    }
                    let x = getstorage(args[1]) + getstorage(args[2]);
                    if (args.length == 4) this.storages[args[3].slice(1)] = x;
                    else this.drg = x;
                    break;
                case 'mul':
                    if (validateArgumentCount(3, args, true)) break;
                    if (!expectedTypeArgs(new Array(2).fill([XZ.argumentType.STORAGE, XZ.argumentType.NUMBER]), args.slice(1)) || (args.length == 4 && judgeArg(args[3]))) {
                        trackError(Errors.InvalidArgumentError, 'invalid argument');
                        break;
                    }
                    let y = getstorage(args[1]) * getstorage(args[2]);
                    if (args.length == 4) this.storages[args[3].slice(1)] = y;
                    else this.drg = y;
                    break;
                case 'sub':
                    if (validateArgumentCount(3, args, true)) break;
                    if (!expectedTypeArgs(new Array(2).fill([XZ.argumentType.STORAGE, XZ.argumentType.NUMBER]), args.slice(1)) || (args.length == 4 && judgeArg(args[3]))) {
                        trackError(Errors.InvalidArgumentError, 'invalid argument');
                        break;
                    }
                    let x1 = getstorage(args[1]) - getstorage(args[2]);
                    if (args.length == 4) this.storages[args[3].slice(1)] = x1;
                    else this.drg = x1;
                    break;
                case 'div':
                    if (validateArgumentCount(3, args, true)) break;
                    if (!expectedTypeArgs(new Array(2).fill([XZ.argumentType.STORAGE, XZ.argumentType.NUMBER]), args.slice(1)) || (args.length == 4 && judgeArg(args[3]))) {
                        trackError(Errors.InvalidArgumentError, 'invalid argument');
                        break;
                    }
                    let y1 = getstorage(args[1]) / getstorage(args[2]);
                    if (args.length == 4) this.storages[args[3].slice(1)] = y1;
                    else this.drg = y1;
                    break;
                case "create":
                    if (validateArgumentCount(1, args)) break;
                    if (/[^a-zA-Z]/g.test(args[1])) {
                        trackError(Errors.InvalidArgumentError, 'invalid storage key');
                        break;
                    }
                    this.storages[args[1]] = 0;
                    break;
                case "write":
                    if (validateArgumentCount(2, args, true)) break;
                    args.push('&');
                    if (judgeArg(args[2])) {
                        trackError(Errors.InvalidArgumentError, 'invalid storage key');
                        break;
                    }
                    if (judgeArg(args[1]) % 2) {
                        trackError(Errors.InvalidArgumentError, 'invalid argument');
                        break;
                    }
                    if (args[2] == '&') this.drg = getstorage(args[1]);
                    else this.storages[args[2].slice(1)] = getstorage(args[1]);
                    break;
                case 'if':
                    if (validateArgumentCount(1, args, true)) break;
                    args.push('&');
                    if (!getstorage(args[1])) {
                        line += 2;
                        for (let k = 1; k && line != this._commands.length; line++) {
                            if (this._commands[line].startsWith('start')) k++;
                            if (this._commands[line].startsWith('over')) k--;
                        }
                    }
                    break;
                case 'ifnot':
                    if (validateArgumentCount(1, args, true)) break;
                    args.push('&');
                    if (getstorage(args[1])) {
                        line += 2;
                        for (let k = 1; k && line != this._commands.length; line++) {
                            if (this._commands[line].startsWith('start')) k++;
                            if (this._commands[line].startsWith('over')) k--;
                        }
                    }
                    break;
                case 'compair':
                    if (validateArgumentCount(3, args, true)) break;
                    args.push('&');
                    let cmp = Number(getstorage(args[1]) > getstorage(args[2]));
                    if (args[3] == '&') this.drg = cmp;
                    else this.storages[args[3].slice(1)] = cmp;
                    break;
                case 'loop':
                    if (validateArgumentCount(1, args, true)) break;
                    args.push('&')
                    if (judgeArg(args[1])) {
                        trackError(Errors.InvalidArgumentError, 'invalid storage key');
                        break;
                    }
                    if (!getstorage(args[1])) {
                        line += 2;
                        for (let k = 1; k && line != this._commands.length; line++) {
                            if (this._commands[line].startsWith('start')) k++;
                            if (this._commands[line].startsWith('over')) k--;
                        }
                        line--;
                    }
                    break;
            }
        }
        this.running = false;
    }
}

module.exports = { XZ };