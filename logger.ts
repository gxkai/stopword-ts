const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf, prettyPrint, colorize, json } = format
const moment = require('moment')
require('winston-daily-rotate-file')
const timeFormat = format((info, options) => {
  info.timestamp = moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss:SS')
  return info
})
const procIndex = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : 0
const files = new transports.DailyRotateFile({
  filename: `./${process.env.NODE_ENV}-logs/${procIndex}/${process.pid}_%DATE%.log`,
  prepend: true,
  createTree: true,
  handleExceptions: true,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})
const consoleT = new transports.Console({
  format: combine(
    colorize()
  )
})
const logger = createLogger({
  format: combine(
    timestamp(),
    timeFormat(),
    prettyPrint()
  )
})
logger.add(files)
if (process.env.NODE_ENV === 'development') {
  logger.add(consoleT)
}
module.exports = {
  logger
}
