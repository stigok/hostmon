const Emitter = require('events')

class Alarm extends Emitter {
  constructor ({timeout, autostart=true}) {
    super()

    console.log('timeout', timeout)
    if (!timeout || typeof timeout !== 'number') {
      throw new Error('Must specify a timeout')
    }

    this._timeout = timeout

    if (autostart) {
      this.start()
    }
  }

  stop () {
    clearTimeout(this._alarmTimer)
  }

  start () {
    this.stop()
    this.extend()
  }

  extend () {
    this.emit('extend', this._timeout)

    clearTimeout(this._alarmTimer)

    this._alarmTimer = setTimeout(() => {
      this.emit('alarm')
    }, this._timeout)
  }
}

module.exports = Alarm

