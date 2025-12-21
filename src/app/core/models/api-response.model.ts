import { StatusCode } from './status-code.model';

export class ApiResponse<T> {
  httpCode?: number | null;
  httpMessage?: string | null;

  code?: number | null;      // maps to ErrorCode.errorCode
  message?: string | null;   // maps to ErrorCode.errorMessage

  data?: T | null;

  constructor(init?: Partial<ApiResponse<T>>) {
    Object.assign(this, init);
  }

  /**
   * Success helper
   */
  static success<T>(data: T): ApiResponse<T> {
    const successCode = new StatusCode(0, 'Success' );
    return new ApiResponse<T>({
      httpCode: 200,
      httpMessage: 'OK',
      code: successCode.errorCode,
      message: successCode.errorMessage,
      data: data
    });
  }

  /**
   * Error helper
   */
  static error<T>(httpCode: number, httpMessage: string, errorCode: StatusCode): ApiResponse<T> {
    return new ApiResponse<T>({
      httpCode: httpCode,
      httpMessage: httpMessage,
      code: errorCode.errorCode ?? null,
      message: errorCode.errorMessage ?? null,
      data: null
    });
  }
}