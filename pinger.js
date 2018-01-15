const Emitter = require('events')
const { spawn } = require('child_process')
const es = require('event-stream')

// Default options
const defaults = {
  hostname: null
}
Object.freeze(defaults)

const hostUpPattern = /\d+ bytes from .+ time=([\d.]+) ms/
const noAnswerPattern = /no answer yet for icmp_seq=(\d+)/

// Main function
function Pinger (options) {
  const opts = Object.assign(options, {
    foo: 'bar'
  })

  const emitter = new Emitter()
  const args = ['-ndO', '-i 1', '-W 3', options.hostname]
  const proc = spawn('ping', args)
  proc.stdout.pipe(process.stdout)
  proc.stderr.pipe(process.stderr)

  emitter.kill = () => proc.kill()

  proc.stdout
    .pipe(es.split())
    .pipe(es.map((line, next) => {
      const hostUp = hostUpPattern.exec(line)
      const noAnswer = noAnswerPattern.exec(line)

      if (hostUp) {
        emitter.emit('pong', { ms: Number(hostUp[1]) })
      } else if (noAnswer) {
        emitter.emit('timeout')
      }

      next()
    }))

  return emitter
}

module.exports = Pinger

if (!module.parent) {
  const logger = require('./logger')('Pinger')

  const pinger = Pinger({hostname: 'stigok.com'})
    .on('pong', (res) => logger.info('Got answer in %d ms', res.ms))
    .on('unreachable', (err) => logger.error(err))

  process.on('SIGINT', () => pinger.kill())
}

