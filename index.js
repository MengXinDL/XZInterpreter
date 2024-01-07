const { XZ } = require('./XZ.js');

const X=XZ.create();
X.command=`start
write 7 &n
write 5 &m
write 1 &
write 1 &k
write &n
write 1 &ans
loop
start
mul &ans & &ans
sub & 1
over
sub &n &m
loop
start
mul &k & &k
sub & 1
over
div &ans &k &ans
write &m
write 1 &k
loop
start
mul &k & &k
sub & 1
over
div &ans &k &ans
log &ans
over`;
console.log(X.command);
X.run();
