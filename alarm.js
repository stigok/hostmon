/*
Returns an EventEmitter that emits an 'alarm' event whenever it goes off.
Instantiate an Alarm with a timeout amount in milliseconds.
Invoking extend() will reset the alarm and make it count back down from timeout
again.

Example usage:

const alarm = new Alarm({timeout: 10000})
setTimeout(() => alarm.extend(), 5000)
alarm.on('alarm', () => console.log('~15 seconds have passed'))
alarm.on('reset', () => console.log('The alarm was extended after an alarm event'))

*/

const Emitter = require('events')

class Alarm extends Emitter {
  constructor ({timeout, autostart=true}) {
    super()

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
    this._emitResetOnNextExtend = false
  }

  start () {
    this.stop()
    this.extend()
  }

  extend () {
    if (this._emitResetOnNextExtend) {
      this.emit('reset')
      this._emitResetOnNextExtend = false
    }

    this.emit('extend', this._timeout)

    clearTimeout(this._alarmTimer)
    this._alarmTimer = setTimeout(() => this._onAlarm(), this._timeout)
  }

  _onAlarm () {
    this.emit('alarm')
    this._emitResetOnNextExtend = true
  }
}

module.exports = Alarm

