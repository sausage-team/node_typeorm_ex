const Progress = require('progress')

Progress.prototype.reset = function () {
  this.terminate()
  this.curr = 0
  this.complete = false
}

function ProgressBar (description, length) {
  return new Progress(` ${description} [:bar] :rate/bps :percent :etas`, {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: length,
      clear: true
    });
}

// 模块导出
module.exports = ProgressBar