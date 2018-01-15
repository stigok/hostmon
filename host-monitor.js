const Emitter = require('events')
//const { format } = require('util')
//const assert = require('assert')

const Pinger = require('./pinger')
const Logger = require('./logger')

class HostMonitor extends Emitter {
  constructor (options) {
    super()

    this.options = Object.assign({
      host: null,
      timeout: 15000
    }, options)

    this.logger = new Logger(`HostMon ${this.options.host}`)
    this.pinger = new Pinger(this.options)
    this.setNewAlarm()
    this.pinger.on('data', (res) => this.onData(res))
  }

  onData (res) {
    if (res.status === 'up') {
      this.setNewAlarm()
      this.emit('ping', res.ping)
    }
  }

  setNewAlarm () {
    this.logger.debug('Alarm extended')

    // It's okay if alarmTimer is undefined
    clearTimeout(this._alarmTimer)

    this._alarmTimer = setTimeout(() => {
      this.emit('dead')
    }, this.options.timeout)
  }
}

module.exports = HostMonitor

