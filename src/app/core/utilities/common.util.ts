//import { v4 as uuidv4 } from 'uuid';

import { IHttpConfig, IApiUrl } from '../models/http-config.interface';
/**
 * Adds frontend-only masking flags to backend items.
 */
export class CommonUtil {
	/*
	static getId() {
	  // blake3 is not available in the browser
	  // remove the dashes from the uuid
	  const u = uuidv4().replace(/-/g, "");
	  // return the last 10 characters of the uuid
	  return u;
	}
	*/
	/**
	 * Search the value of an specific cookie
	 * @param name the name of the cookie to search
	 * @returns dfdddd
	 */
	static getCookie(name: string) {
		const ca: Array<string> = document.cookie.split(';');
		const caLen: number = ca.length;
		const cookieName = name + '=';
		let c: string;
		for (let i = 0; i < caLen; i += 1) {
			c = ca[i].trim();
			if (c.indexOf(cookieName) === 0) {
				return c.substring(cookieName.length, c.length);
			}
		}
		return '';
	}

	/**
	 * Convert from seconds to a valid UTC date in string format
	 * @param seconds the total amount of seconds
	 * @returns ddd
	 */
	static changeExpiredTime(seconds: number): string {
		const now = new Date();
		now.setTime(now.getTime() + seconds);
		return now.toUTCString();
	}

	/**
	 * Determine if a value is empty or not
	 * @param val the value to check
	 * @returns ddd
	 */
	static isEmpty(val: string): boolean {
		return val === undefined || val == null || val.length <= 0 ? true : false;
	}

	/**
	 * Return the url used to call specific api service
	 * @param name the name of the api service
	 * @param apiConfig the api settings by environment
	 * @returns ddd
	 */
	static getApiUrl(name: string, apiConfig: IHttpConfig) {
		if (!apiConfig.apiUrls) {
			return null;
		}
		const result = apiConfig.apiUrls.find((apiUrl: IApiUrl) => apiUrl.id === name);
		return result ? result.url : null;
	}

	/**
	 * Return the api url data related to an specific api service from the url
	 * @param url the url from which search the config
	 * @param apiConfig the api settings by environment
	 * @returns an instance of the ApiUrl found
	 */
	/*
    static getApiByUrl(url: string, apiConfig: ApiConfig): ApiUrl {
        return apiConfig.apiUrls.find(apiUrl => apiUrl.url === url);
    }
	*/
}
