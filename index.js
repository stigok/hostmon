const assert = require('assert')
const HostMon = require('./host-monitor')
const Logger = require('./logger')

const timeout = 10000
const host = process.argv[2]
assert(host, 'Missing first argument <host>')

const logger = new Logger(host)
const mon = new HostMon({ host, timeout })

mon.on('ping', (ms) => logger.info('Host answered', ms))
mon.on('dead', () => logger.error('Host has not responded within timeout...'))

logger.info('Monitoring host %s', host)
logger.info('Will report dead if not responding within %dms', timeout)

