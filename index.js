var stream  = require('stream');
var   util  = require('util');
var buffers = require('buffers');
var assert  = require('assert');


// creates new shaped trough stream
var ShapeStream = function (byteRate, chunkRate, lowWatermark, highWatermark) {
    this.rate = byteRate; // float number!
    if (!chunkRate)
        chunkRate = 10;
    if (!lowWatermark)
        lowWatermark = 0;
    if (!highWatermark)
        highWatermark = 0;
   
    this.checkInterval = 1000/chunkRate;
    this.buffer = buffers();
    this.startTime = Date.now();
    this.totalWritten = 0;
    this.writable = true;
    this.readable = true;
    this.sendTimer = null;
}
util.inherits(ShapeStream, stream.Stream);

// dont' need these, use inherited Stream.pipe
/*
ShapeStream.prototype.pipe = function (dest, opts) {
    var self = this;

    dest.on('drain', function() {
       if (self.paused)
          self.resume();
    });

    self.on('data', function(data) {
        var buffered = !dest.write(data);
        if (buffered)
            self.pause();
    });

    if (!opts || (opts && opts.end === true) || (opts && typeof opts.end === 'undefined'))
        self.on('end', function() {
            dest.end();
        });

    self.emit('pipe');
    return dest;
};
*/

ShapeStream.prototype.expectedWritten = function() {
    return parseInt(this.rate*(Date.now() - this.startTime)/1000);
}

ShapeStream.prototype.processBuffer = function() {
    var expected = this.expectedWritten();
    if (expected > this.totalWritten) {
      var lengthToWrite = expected - this.totalWritten;
      var chunk = this.buffer.splice(0, lengthToWrite);
      this.doWrite(chunk.toBuffer());
    }
    if (buffer.lengh <= this.lowWatermark && !this.stopping)
        this.emit('drain');

    if (this.buffer.length == 0) {
        if (this.stopping)
           this.emit('close');
    } else
        this.sendTimer = setTimeout(this.processBuffer.bind(this), this.checkInterval);
}

ShapeStream.prototype.doWrite = function(chunk)
{
    this.totalWritten += chunk.length;
    this.emit('data', chunk);
}

ShapeStream.prototype.write = function(chunk, encoding) {
    if (typeof chunk === 'string')
        chunk = Buffer(chunk, encoding);
    var expected = this.expectedWritten();
    if (this.totalWritten + chunk.length < this.expectedWritten() && !this.paused)
    {
        this.doWrite(chunk);
        return true;
    }
    this.buffer.push(chunk);
    if (!this.paused)
        this.processBuffer();
    return this.buffer.length < this.highWatermark;
};

ShapeStream.prototype.end = function(chunk, encoding) {
    this.stopping = true;
    if (chunk)
        this.write(chunk, encoding);
    else
        this.processBuffer();
};

ShapeStream.prototype.pause = function() {
    this.pauseCount++;
    this.paused = true;
};

ShapeStream.prototype.resume = function() {
    this.pauseCount--;
    if (this.pauseCount == 0) {
        this.paused = false;
        this.processBuffer();
    }
};

ShapeStream.prototype.destroy = function() {
    // do nothing
}

ShapeStream.prototype.destroySoon = function() {
    // do nothing
}

module.exports = function(byteRate, chunkRate) {
   return new ShapeStream(byteRate, chunkRate);
}
