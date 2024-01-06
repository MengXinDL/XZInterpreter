const { XZ } = require('./XZ.js');

const X=XZ.create();
X.conmmand='start';
X.conmmand='create a';
X.conmmand='create b';
X.conmmand='create c';
X.conmmand='write 5.5 &a';
X.conmmand='add &a -4 &b';
X.conmmand='mul &a &b &c'
X.conmmand='log &a &b &c'
X.conmmand='over';
console.log(X.conmmand);
X.run();