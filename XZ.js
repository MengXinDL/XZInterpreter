const Errors = require('./error.js');
const commands = require('./command.js');
class XZ {
    static create() {
        return new XZ();
    }

    constructor(c = false) {
        this._commands = [];
        this.c = c;
        this.storages = {};
        this.running = false;
    }
    /**
     * @param {string} value
     */
    set conmmand(value) {
        if (!this.running) this._commands.push(value);
    }
    get conmmand() {
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
        let that = this;
        let line = 0
        /**
         * @param {string} str
         */
        function judgeArg(str) {
            if (str.startsWith('&')) {
                str = str.slice(1);
                if (/[^a-zA-Z]/g.test(str)) return 1;
                else return 0;
            }
            else if (/^[-+]?\d+(\.\d+)?$/.test(str)) return 2;
            return 3;
            
        }
        /**
         * @param {string} str 
         */
        function getstorage(str) {
            if (str.startsWith("&")) return that.storages[str.slice(1)];
            else return parseFloat(str);
        }
        function ivdarg(n, v) {
            if (v.length != n+1) {
                console.warn(
                    Errors.InvalidArgumentError,
                    `: Expected ${n} argument but found ${v.length - 1} at line ` + (line+1)
                );
                return true;
            }
            return false;
        }
        for (line = 0;line != this._commands.length;line++) {
            let c = this._commands[line].split(' ');
            if (!commands.includes(c[0])) {
                console.warn(Errors.InvalidCommandError, ': the command does not exist at line ' + (line+1));
                line++;continue;
            }
            switch (c[0]) {
                case 'start':
                    sl.push(line);
                    break;
                case 'over':
                    if (sl.length == 0) {
                        console.warn(
                            Errors.InvalidCommandError,
                            ': an "over" command with no "start" at line ' + (line+1)
                        );
                        break;
                    }
                    let p = sl.pop();
                    if (p > 0 && this._commands[p - 1].startsWith("loop"))
                        line = p - 2;
                    break;
                case 'log':
                    console.log(...c.map((value)=>{
                        if(judgeArg(value)==0)return this.storages[value.slice(1)];
                        return value;
                    }));
                    break;
                case 'add':
                    if (ivdarg(3,c,line))break;
                    let q = [judgeArg(c[1]), judgeArg(c[2]), judgeArg(c[3])];
                    if (q[0] % 2 || q[1] % 2 || q[2]) {
                        console.warn(
                            Errors.InvalidArgumentError,
                            `at line ${line+1}`
                        );
                        break;
                    }
                    let x=getstorage(c[1]),y=getstorage(c[2]);
                    this.storages[c[3].slice(1)]=x+y;
                    break;
                case 'mul':
                    if (ivdarg(3,c,line))break;
                    let q1 = [judgeArg(c[1]), judgeArg(c[2]), judgeArg(c[3])];
                    if (q1[0] % 2 || q1[1] % 2 || q1[2]) {
                        console.warn(
                            Errors.InvalidArgumentError,
                            `at line ${line+1}`
                        );
                        break;
                    }
                    let x1=getstorage(c[1]),y1=getstorage(c[2]);
                    this.storages[c[3].slice(1)]=x1*y1;
                    break;
                case "create":
                    if (ivdarg(1,c,line))break;
                    if (/[^a-zA-Z]/g.test(c[1])) {
                        console.warn(
                            Errors.InvalidArgumentError,
                            ": Invalid storage key at line " + (line+1)
                        );
                        break;
                    }
                    this.storages[c[1]] = 0;
                    break;
                case "write":
                    if (ivdarg(2,c,line))break;
                    if (judgeArg(c[2])) {
                        console.warn(
                            Errors.InvalidArgumentError,
                            ": Invalid storage key at line " + (line+1)
                        );
                        break;
                    }
                    if(judgeArg(c[1])%2){
                        console.warn(
                            Errors.InvalidArgumentError,
                            "at line " + line
                        );
                        break;
                    }
                    this.storages[c[2].slice(1)] = getstorage(c[1]);
                    break;
            }
        }
        this.running = false;
    }
}

module.exports = {XZ};
