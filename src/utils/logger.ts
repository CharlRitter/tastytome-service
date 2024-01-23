class Logger {
  private logPrefix(logLevel: string): string {
    return `${new Date()} ${logLevel}:`;
  }

  public info(...args: any[]): void {
    console.log(this.logPrefix('INFO'), ...args);
  }

  public debug(...args: any[]): void {
    console.log('\x1b[33m%s\x1b[0m', this.logPrefix('DEBUG'), ...args);
  }

  public error(...args: any[]): void {
    console.log('\x1b[31m%s\x1b[0m', this.logPrefix('ERROR'), ...args);
  }
}

export const logger = new Logger();
