const winston = require('winston')

const filter = winston.format((info, opts) => {
    if (info.level === opts.level) {
        return info
    }
})

const format = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`
})

//create logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        format
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                filter({ level: 'error' }),
                winston.format.timestamp(),
                format
            )
        }),
        new winston.transports.File({
            filename: 'logs/warn.log',
            level: 'warn',
            format: winston.format.combine(
                filter({ level: 'warn' }),
                winston.format.timestamp(),
                format
            )
        }),
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                filter({ level: 'info' }),
                winston.format.colorize(),
                winston.format.timestamp(),
                format
            )
        })
    ]
})

module.exports = logger





