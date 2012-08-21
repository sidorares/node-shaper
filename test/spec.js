var spec = require('stream-spec')
var tester = require('stream-tester')

var shaper = require('..');

var stream = shaper(100000);

spec(stream)
  .through({strict: true})
  .validateOnExit()

tester.createRandomStream(function () {
    return 'line ' + Math.random() + '\n'
  }, 1000)
  .pipe(stream)
  .pipe(tester.createPauseStream())
