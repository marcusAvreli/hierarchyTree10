import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap, catchError, throwError, map } from 'rxjs';

import { AuthConfig } from '../models/auth-config.model';
import { CustomHeaders } from '../models/custom-headers.model';
import { IHttpConfig, IHttpMeta } from '../models/http-config.interface';
import { InterceptorUrls } from '../models/interceptor-urls.model';

/**
 * Cleans up the subscription when the component is destroyed.
 */
@Injectable()
export class ConfigService implements IHttpConfig {
	/** test */
	interceptUrls!: InterceptorUrls;
	/** test */
	authConfig?: AuthConfig;
	/** test */
	propertiesFile: string = '/properties.json';
	/** test */
	meta: IHttpMeta = {};
	/** test */
	appId: string = '';
	/**
	 * Creates an instance of the ConfigService.
	 * This service is responsible for loading and managing application-level configuration
	 * settings (such as API endpoints, authentication configuration, or environment metadata).
	 * @param http Angular's built-in {@link HttpClient} used to fetch configuration files (e.g., `/properties.json`) from the server.
	 */
	constructor(private readonly http: HttpClient) {}

	/**
	 * Loads and initializes the application configuration.
	 * This method merges any provided configuration overrides with the default configuration,
	 * then loads additional properties from a JSON file (typically `properties.json`).
	 * The loaded values are stored within the service for global access throughout the app.
	 * @param config (optional) A partial {@link IHttpConfig} object used to override or supplement default settings before loading the configuration file. For example:      `{ propertiesFile: '/custom-properties.json' }`.
	 * @returns An {@link Observable} emitting the loaded {@link IHttpConfig} data once available. The Observable completes after the configuration is successfully retrieved and merged.
	 */
	load(config?: Partial<IHttpConfig>): Observable<IHttpConfig> {
		const assignValue = <K extends keyof IHttpConfig>(key: K, value: IHttpConfig[K]): void => {
			(this as IHttpConfig)[key] = value;
		};
		// Assign provided config safely
		if (config) {
			Object.keys(config).forEach(key => {
				const k = key as keyof IHttpConfig;
				if (config[k] !== undefined) {
					//this[k] = config[k]  as this[keyof IHttpConfig];
					assignValue(k, config[k]);
				}
			});
		}
		const propertiesPath = this.propertiesFile || '/properties.json';
		// Ensure propertiesFile is set
		// Check if file exists and load
		return this.http.get<IHttpConfig>(propertiesPath, { observe: 'response' }).pipe(
			map((response: HttpResponse<IHttpConfig>) => response.body || {}), // map to body
			tap(res => {
				Object.keys(res).forEach(key => {
					const k = key as keyof IHttpConfig;
					if (res[k] !== undefined) {
						assignValue(k, res[k]);
					}
				});
			}),
			catchError(err => {
				if (err.status === 404) {
					console.warn(`Config file not found: ${propertiesPath}, using default values.`);
					return of(this); // return current instance
				}
				return throwError(() => err);
			})
		);
	}

	/**
	 * Updates or merges custom HTTP headers for a specific interceptor URL group.
	 * This method allows dynamically adding or overriding headers in the application's
	 * interceptor configuration. It ensures the target interceptor group exists and
	 * initializes its headers object if needed before applying the updates.
	 * @param interceptorUrl The key identifying the interceptor group (for example, an API base URL or alias).
	 * @param headers An object containing one or more custom headers to set or override (e.g., `{ 'Authorization': 'Bearer token', 'X-Custom': 'value' }`).
	 */
	setInterceptorHeaders(interceptorUrl: string, headers: CustomHeaders): void {
		const configGroup = this.interceptUrls?.[interceptorUrl];
		if (configGroup) {
			// Ensure headers object exists
			configGroup.headers = configGroup.headers ?? {};
			Object.keys(headers).forEach(key => {
				configGroup.headers![key] = headers[key];
			});
		}
	}

	/**
	 * Retrieves a meta property by key in a type-safe manner.
	 * @param key The name of the meta property to retrieve.
	 * @returns A string representation of the meta value if it exists, or `undefined` if the key is not found.
	 * The method ensures that all meta values are safely converted to strings,
	 * even if the original value is of another type (e.g., number or boolean),
	 * to prevent runtime type errors in UI bindings or logs.
	 */
	getMeta(key: string): string | undefined {
		const value = this.meta[key];
		return typeof value === 'string' ? value : String(value ?? '');
	}
}
