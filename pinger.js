const Emitter = require('events')
const { spawn } = require('child_process')
const es = require('event-stream')

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
    this.start()
  }

  start () {
    // Spawn ping process
    this._proc = spawn('ping', [
      '-n', // no resolve hostname
      '-D', // print timestamp
      '-O', // report outstanding replies before send
      `-i ${this.options.timeoutSec}`, // interval
      '-W 3', // ping timeout
      this.options.host
    ])

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

        next()
      }))
  }

  stop () {
    return this._proc.exit()
  }
}

module.exports = Pinger

