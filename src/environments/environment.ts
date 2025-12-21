// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// the timeExpired is expressed in seconds. By default is set to 20 minutes

//import {AuthTypes} from '../app/core/factories/auth.type';
//import {ErrorHandlerTypes} from '../app/core/factories/error-handler.type';
//import {LoggerTypes} from '../app/core/factories/logger.type';
//import {AuthScheme} from '../app/core/models/auth-scheme.enum';
//

/** ggggg */
const server = 'http://localhost:8080/pictureGalleryHibernate/api';
/** ggggg */
export const environment = {
	authority: `${server}/oauth2`,
	production: false,
	root_api_url: `${server}`,
	user_api_url: `http://localhost:3000/users/`
};
