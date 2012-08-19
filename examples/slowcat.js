var shaper = require('..');

process.stdin.pipe(shaper(10)).pipe(process.stdout, {end: false} );
process.stdin.resume();
