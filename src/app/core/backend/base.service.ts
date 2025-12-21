import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { LoggerService } from '../services/logger.service';

/**
 * Unwraps ApiResponse<T> to T, forwards ApiResponse errors to subscriber
 */
export function unwrapApiResponse<T>() {
  return (source: Observable<ApiResponse<T>>): Observable<T> =>
    source.pipe(
      map(res => {
        if (res.data === null || res.data === undefined) {
          throw res; // forward as error if data is missing
        }
        return res.data;
      }),
      catchError((err: unknown) => {
        if (err instanceof ApiResponse) return throwError(() => err);
        if (err instanceof HttpErrorResponse) {
          return throwError(() => new ApiResponse<T>({
            httpCode: err.status,
            httpMessage: err.message,
            code: -1,
            message: err.error?.message ?? 'HTTP Error',
            data: null
          }));
        }
        if (err instanceof Error) {
          return throwError(() => new ApiResponse<T>({
            httpCode: 500,
            httpMessage: 'Unknown error',
            code: -1,
            message: err.message,
            data: null
          }));
        }
        return throwError(() => new ApiResponse<T>({
          httpCode: 500,
          httpMessage: 'Unknown error',
          code: -1,
          message: 'Unexpected error',
          data: null
        }));
      })
    );
}

export abstract class BaseService<T> {
  constructor(protected http: HttpClient, protected logger: LoggerService) {}

  abstract getServiceUrl(): string;

  /**
   * Get a single item by ID (returns plain T)
   */
  findById(id: string): Observable<T> {
    const url = `${this.getServiceUrl()}/${id}`;
    return this.http.get<ApiResponse<T>>(url).pipe(
      unwrapApiResponse<T>()
    );
  }

  /**
   * Get all items (returns plain T[])
   */
  findAll(): Observable<T[]> {
    const url = this.getServiceUrl();
    return this.http.get<ApiResponse<T[]>>(url).pipe(
      unwrapApiResponse<T[]>()
    );
  }

  /**
   * Delete an item
   */
  delete(id: string): Observable<void> {
    const options = { headers: this.getOptionsWithToken('token').headers };
    return this.http
      .delete<ApiResponse<unknown>>(`${this.getServiceUrl()}/${id}`, options)
      .pipe(
        unwrapApiResponse<unknown>(),
        map(() => void 0) // return void
      );
  }

  /**
   * Insert single item
   */
  insert(data: T): Observable<T> {
    const options = { headers: this.getOptionsWithToken('token').headers };
    return this.http
      .post<ApiResponse<T>>(`${this.getServiceUrl()}/create`, data, options)
      .pipe(unwrapApiResponse<T>());
  }

  /**
   * Insert multiple items
   */
  insertMany(data: T[]): Observable<T[]> {
    const options = { headers: this.getOptionsWithToken('token').headers };
    return this.http
      .post<ApiResponse<T[]>>(`${this.getServiceUrl()}/create`, data, options)
      .pipe(unwrapApiResponse<T[]>());
  }

  /**
   * Update an item
   */
  update(fieldId: string, data: any): Observable<T> {
    const options = { headers: this.getOptionsWithToken('token').headers };
    return this.http
      .put<ApiResponse<T>>(`${this.getServiceUrl()}/${data[fieldId]}`, JSON.stringify(data), options)
      .pipe(unwrapApiResponse<T>());
  }

  /**
   * Helper to build request headers
   */
  protected getOptionsWithToken(token: string): any {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return { headers };
  }
}
