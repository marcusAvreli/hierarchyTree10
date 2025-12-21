import { Injectable, Inject, Optional } from '@angular/core';
import { LOGGER_CONFIG, LoggerConfig } from '../tokens/logger-config.token';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'off';

@Injectable({providedIn: 'root'})
export class LoggerService {
  private levelOrder: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'off'];
  private currentLevel: LogLevel = 'info';

  constructor(@Optional() @Inject(LOGGER_CONFIG) private config?: LoggerConfig) {
	
    this.currentLevel = config?.level ?? 'info';
    
  }

  private shouldLog(level: LogLevel): boolean {
     return this.levelOrder.indexOf(level) >= this.levelOrder.indexOf(this.currentLevel);
  }

  private log(level: LogLevel, ...args: any[]): void {
	
	
    if (!this.shouldLog(level)) return;

    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = new Date().toISOString();




 

  // force output regardless of console filtering
 
    // Customize output or forward to server here
    switch (level) {
      case 'trace':

      case 'debug':
        console.debug(prefix, timestamp, ...args);
        break;
      case 'info':
        console.info(prefix, timestamp, ...args);
        break;
      case 'warn':
        console.warn(prefix, timestamp, ...args);
        break;
      case 'error':
        console.error(prefix, timestamp, ...args);
        break;
    }
  }

  trace(...args: any[]): void { this.log('trace', ...args); }
  debug(...args: any[]): void { this.log('debug', ...args); }
  info(...args: any[]): void { this.log('info', ...args); }
  warn(...args: any[]): void { this.log('warn', ...args); }
  error(...args: any[]): void { this.log('error', ...args); }
}
