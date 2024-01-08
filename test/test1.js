const { XZ } = require('../src/index.js');

const X=XZ.create();
X.setCommand(`
start
create a
create b
create c
write 5.5 &a
add &a -4 &b
mul &a &b &c
log &a &b &c
over`);
console.log(X.command);
X.run();