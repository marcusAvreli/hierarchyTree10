// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// the timeExpired is expressed in seconds. By default is set to 3 minutes

//import {AuthTypes} from '../app/core/factories/auth.type';
//import {ErrorHandlerTypes} from '../app/core/factories/error-handler.type';
//import {LoggerTypes} from '../app/core/factories/logger.type';
//import {AuthScheme} from '../app/core/models/auth-scheme.enum';
/** ggggg */
const server = 'http://localhost:3000/';
/** ggggg */
export const environment = {
	apiConfig: {
		apiEnv: 'mock',
		apiUrls: [
			{ id: 'HEROES_SERVICE_URL', requireAuthBefore: true, url: server + 'api/heroes' },
			{ id: 'VILLAINS_SERVICE_URL', requireAuthBefore: true, url: server + 'api/villains' },
			{ id: 'OAUTH_SERVICE_URL', requireAuthBefore: false, url: server + 'api/oauth/token' },
			{ id: 'EDITORIAL_SERVICE_URL', requireAuthBefore: true, url: server + 'api/editorials' }
		],
		credentials: {
			clientId: 'clientUserId',
			clientSecret: 'clientPwd'
		},
		timeExpired: 1200
		//  authService: AuthTypes.OAUTH,
		//  authScheme: AuthScheme.BEARER,
		// errorHandler: ErrorHandlerTypes.SIMPLE,
		//  loggerService: LoggerTypes.CONSOLE,
	},
	appName: 'Angular Demo Application',
	buildTimestamp: new Date().toISOString(),
	buildVersion: '2.0.0-SNAPSHOT',
	defaultLanguage: 'en',
	envName: 'mock',
	production: false
};
