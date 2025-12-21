// src/app/core/tokens/logger-config.token.ts
import { InjectionToken } from '@angular/core';

export interface LoggerConfig {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'off';
}

export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG');
