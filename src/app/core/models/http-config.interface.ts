import { AuthConfig } from './auth-config.model';
import { InterceptorUrls } from './interceptor-urls.model';

/**
 * Cleans up the subscription when the component is destroyed.
 */
export interface IHttpMeta {
	/** test */
	version?: string;
	/** test */
	environment?: string;
	/** test */
	[key: string]: unknown;
}

/**
 * Cleans up the subscription when the component is destroyed.
 */
export interface IHttpConfig {
	/** test */
	interceptUrls?: InterceptorUrls;
	/** test */
	propertiesFile?: string;
	/** test */
	authConfig?: AuthConfig;
	/** test */
	meta?: IHttpMeta;
	/** test */
	appId?: string;
	/** test */
	apiUrls?: Array<IApiUrl>; // ✅ added this
}

export interface IApiUrl {
	id: string;
	url: string;
}
