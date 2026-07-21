type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }
  }

  private output(entry: LogEntry) {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    const message = `${prefix} ${entry.message}`

    if (entry.data) {
      if (this.isDevelopment) {
        console.log(message, entry.data)
      } else {
        console.log(message, JSON.stringify(entry.data))
      }
    } else {
      console.log(message)
    }
  }

  info(message: string, data?: any) {
    const entry = this.formatLog('info', message, data)
    this.output(entry)
  }

  warn(message: string, data?: any) {
    const entry = this.formatLog('warn', message, data)
    this.output(entry)
  }

  error(message: string, data?: any) {
    const entry = this.formatLog('error', message, data)
    this.output(entry)
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      const entry = this.formatLog('debug', message, data)
      this.output(entry)
    }
  }
}

export const logger = new Logger()
