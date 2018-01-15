// let's go bro

#!/usr/bin/env node

const EventEmitter = require('events')
const { format } = require('util')
const { spawn } = require('child_process')
const assert = require('assert')
const es = require('event-stream')

const TIMEOUT = 10 * 1000



function HostMonitor (options) {
        const emitter = new EventEmitter()
        let alarmTimer

        // Emit 'dead' event if nothing has happened within time limit
        function setNewAlarm () {
                if (typeof alarmTimer !== 'undefined')
                        alarmTimer = clearTimeout(alarmTimer)

                alarmTimer = setTimeout(() => {
                        emitter.emit('dead', null)
                }, options.timeout)
        }

        const pinger = new Pinger({hostname: options.hostname})
        pinger.on('pong', (ms) => {
                emitter.emit('pong', ms)
                setNewAlarm()
        })

        return emitter
}

if (!module.parent) {
        const HOSTNAME = process.argv[2]
        assert(HOSTNAME, 'Missing first argument <hostname>')

        const mon = new HostMonitor({hostname: HOSTNAME, timeout: TIMEOUT})

        //mon.on('pong', (ms) => logger.info('Host answered', ms))
        mon.on('dead', () => logger.error('Host not responding...', Date.toLocaleString()))

        logger.info('Monitoring host %s', HOSTNAME)
        logger.info('Will report dead if not responding within %dms', TIMEOUT)
}
