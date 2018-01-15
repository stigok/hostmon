const { format: printf } = require('util')

const levels = {
  info: 'stdout',
  debug: 'stdout',
  error: 'stderr',
  verbose: 'stdout',
  debug: 'stdout'
}

function log (args, prefix, fd='stdout') {
  const timestamp = (new Date()).toString()
  const str = printf(...args)
  process.stdout.write(`${timestamp} ${prefix || '-'} ${str}\n`)
}

function Logger (name) {
  const levelNames = Object.keys(levels)
  const instance = levelNames.reduce((logger, level) => {
    const prefix = `${level.toUpperCase()}: [${name}]`
    logger[level] = (...args) => log(args, prefix, levels[level])
    return logger
  }, {})

  return instance
}

module.exports = Logger

// A simple test to run when executed directly
if (!module.parent) {
  const logger = new Logger('test')
  for (let level in levels) {
    logger[level]('Hello, %s world!', level)
  }
}

