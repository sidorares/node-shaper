var shaper = require('..');
var execStream = require('exec_stream');

var find = execStream('find', ['/']);
find.pipe(shaper(15)).pipe(process.stdout, {end: false} );
