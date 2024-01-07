const { XZ } = require('./XZ.js');

const X=XZ.create();
X.command=`start
create a
create b
create c
write 5.5 &a
add &a -4 &b
mul &a &b &c
log &a &b &c
ifnot &c
start
log 114514
over
over`;
console.log(X.command);
X.run();
