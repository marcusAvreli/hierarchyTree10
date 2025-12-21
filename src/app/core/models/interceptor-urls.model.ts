import { CustomHeaders } from './custom-headers.model';

/**
 * fdsfdfs
 */
export class InterceptorUrls {
	[key: string]: {
		root: string;
		isAuth: boolean;
		headers?: CustomHeaders;
	};
}
