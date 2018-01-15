const Emitter = require('events')
const { format } = require('util')
const assert = require('assert')

const Pinger = require('./pinger')
const Logger = require('./logger')

class HostMonitor extends Emitter {
  constructor (options) {
    super()

    // Merge defaults and user options
    this.options = Object.assign({
      hostname: null,
      timeout: 15000
    }, options)

    this.logger = Logger(`HostMon ${this.options.hostname}`)
    this.alarmTimer = null

    // Start monitoring
    this.pinger = new Pinger(this.options)

    // Set initial alarm
    this.setNewAlarm()

    this.pinger
      .on('pong', (ms) => this.onPong(ms))
      .on('dead', () => this.onTimeout())
      .on('error', (...args) => this.logger.error(...args))
  }

  onPong (ms) {
    this.setNewAlarm()
    this.emit('ping', ms)
  }

  onTimeout () {
    this.emit('timeout')
  }

  setNewAlarm () {
    this.logger.debug('Alarm extended')

    // It's okay if alarmTimer is undefined
    clearTimeout(this.alarmTimer)

    this.alarmTimer = setTimeout(() => {
      this.logger.verbose('alarm went off', this.options.hostname)
      this.emit('dead', this.options.hostname)
    }, this.options.timeout)
  }
}

if (!module.parent) {
  const logger = new Logger('TEST')
  const hostname = process.argv[2]
  const timeout = 10 * 1000

  assert(hostname, 'Missing first argument <hostname>')

  const mon = new HostMonitor({ hostname, timeout })

  mon.on('ping', (ms) => logger.info('Host answered', ms))
  mon.on('timeout', () => logger.error('Host has not responded within timeout...'))

  logger.info('Monitoring host %s', hostname)
  logger.info('Will report dead if not responding within %dms', timeout)
}

