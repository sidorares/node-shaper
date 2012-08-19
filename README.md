shaper
======

### Limit stream speed to bytes per second/chunk per second

Inspired by [node-throttle][nt] module, but acts as a through stream and splits input chunks if required to maintain target speed as close as possible.

Installation
------------

``` bash
$ npm install shaper
```

Examples
--------

'Slow cat' example:

```js
    var shape = require('shaper');
    process.stdin.pipe(shape(10)).pipe(process.stdout, {end: false} );
    process.stdin.resume();
```

output:  

```
    $ time echo "this is 58-chars long string (including trailing newline)" | node examples/slowcat.js 
    this is 58-chars long string (including trailing newline)

    real	0m5.912s
    user	0m0.056s
    sys	        0m0.012s
```

API
---
 
```js
    var shaper = require('shaper');
    var shapeStream = shaper(byteRate, chunkRate, lowWatermark, highWatermark)
``` 

`byteRate` - targeted speed in bytes per second

`chunkRate` - (default is 10) - output chunk rate. If target speed is 20000 bytes per second and chunk rate is 100, you'll have 100 chunks per second stream, each 200 bytes in size (on average). Note that if input stream is slower then target, chunks are sent immideately at input rate, wich could be higher than target chunk rate. If input is 1000 chunks per second, each 10 bytes `shape(20000, 500)` should give same 1000 chunk per second x 10 bytes stream.

`lowWatermark` - emit `drain` event if buffer size is less than this paremeter. Default to 0.

`highWatermark` - size when buffer is considered full. Default to 0.  


[nt]: https://github.com/TooTallNate/node-throttle
