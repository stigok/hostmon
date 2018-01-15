const assert = require('assert')
const Alarm = require('./alarm')
const Logger = require('./logger')
const Pinger = require('./pinger')

const timeout = 10000
const host = process.argv[2]
assert(host, 'Missing first argument <host>')

const logger = new Logger(host)
const pinger = new Pinger({ host })
const alarm = new Alarm({ timeout: 15000 })

logger.info('Monitoring host %s', host)
logger.info('Will report dead if not responding within %dms', timeout)

pinger.on('data', (res) => {
  if (res.status === 'up') {
    alarm.extend()
  } else {
    logger.info('Missed last reply')
  }
})

alarm.on('alarm', () => logger.error('Host did not respond within time limit'))

