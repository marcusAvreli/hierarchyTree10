// the timeExpired is expressed in seconds. By default is set to 20 minutes

//import {AuthTypes} from '../app/core/factories/auth.type';
//import {ErrorHandlerTypes} from '../app/core/factories/error-handler.type';
//import {LoggerTypes} from '../app/core/factories/logger.type';
//import {AuthScheme} from '../app/core/models/auth-scheme.enum';
/** ggggg */
const server = 'http://localhost:3000/';
/** ggggg */
export const environment = {
	apiConfig: {
		apiEnv: 'prod',
		apiUrls: [
			{ id: 'HEROES_SERVICE_URL', requireAuthBefore: true, url: server + 'api/heroes' },
			{ id: 'VILLAINS_SERVICE_URL', requireAuthBefore: true, url: server + 'api/villains' },
			{ id: 'OAUTH_SERVICE_URL', requireAuthBefore: false, url: server + 'api/oauth/token' },
			{ id: 'EDITORIAL_SERVICE_URL', requireAuthBefore: true, url: server + 'api/editorials' }
		],
		credentials: {
			clientId: 'trustedclient',
			clientSecret: 'trustedclient123'
		},
		timeExpired: 1200
		// authService: AuthTypes.OAUTH,
		//  authScheme: AuthScheme.BEARER,
		//  errorHandler: ErrorHandlerTypes.SIMPLE,
		//  loggerService: LoggerTypes.CONSOLE
	},
	appName: 'Angular Demo Application',
	buildTimestamp: new Date().toISOString(),
	buildVersion: '2.0.0',
	defaultLanguage: 'en',
	envName: 'prod',
	production: true
};
