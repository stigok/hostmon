const Emitter = require('events')
const { spawn } = require('child_process')
const es = require('event-stream')
const Logger = require('./logger')

const log = new Logger('Pinger')
const hostUpPattern = /\d+ bytes from .+ time=([\d.]+) ms/
//const noAnswerPattern = /no answer yet for icmp_seq=(\d+)/

// Main function
class Pinger extends Emitter {
  constructor (opts) {
    super()
    this.options = Object.assign({
      host: null,
      timeoutSec: 3
    }, opts) 
    log.debug('options', this.options)
    this.start()
  }

  start () {
    const defaultPingArgs = [
      `-n`, // no resolve hostname
      `-c 3`, // kill process after 3 ICMP's
      `-W ${this.options.timeoutSec}`,
      `-i ${this.options.timeoutSec + 1}` // packet sending interval
    ]
    const pingArgs = process.env.PING_ARGS && process.env.PING_ARGS.length
      ? process.env.PING_ARGS.split(' ')
      : defaultPingArgs

    pingArgs.push(this.options.host)

    // Spawn ping process
    this._proc = spawn('ping', pingArgs)

    // Handle process output
    this._proc.stdout
      .pipe(es.split())
      .pipe(es.map((line, next) => {
        const hostUp = hostUpPattern.exec(line)

        this.emit('data', {
          host: this.options.host,
          status: hostUp ? 'up' : 'timeout',
          ping: hostUp ? Number(hostUp[1]) : null,
          timestamp: Date.now()
        })

        log.debug('stdout', line)
        next()
      }))

    this._proc.stderr
      .pipe(es.split())
      .pipe(es.map((line, next) => {
        log.debug('stderr', line)
        next()
      }))

    this._proc.on('error', (err) => {
      log.debug('error', err)
    })

    // Restart when process fails
    this._proc.once('close', () => {
      this.start()
    })
  }

  stop () {
    this._proc.removeAllListeners()
    return this._proc.exit()
  }
}

module.exports = Pinger

