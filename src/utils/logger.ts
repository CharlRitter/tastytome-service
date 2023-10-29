class Logger {
  public info(logText: string): void {
    console.log(`${new Date()} INFO: ${logText}`);
  }

  public debug(logText: string): void {
    console.log('\x1b[33m%s\x1b[0m', `${new Date()} DEBUG: ${logText}`);
  }

  public error(logText: string): void {
    console.log('\x1b[31m%s\x1b[0m', `${new Date()} ERROR: ${logText}`);
  }
}

export const logger = new Logger();
