//import { OAuth2Service } from "./services/oauth2.service";
import { firstValueFrom } from 'rxjs';

import { IHttpConfig } from './models/http-config.interface';
import { ConfigService } from './services/config.service';
/**
 * Cleans up the subscription when the component is destroyed.
 * @param appConfig up the subscription when the component is destroyed.
 * @param config up the subscription when the component is destroyed.
 * @returns up the subscription when the component is destroyed.
 */
export function propertiesResolverFactory(
	appConfig: ConfigService,
	config: IHttpConfig
): () => Promise<IHttpConfig> {
	return async () => {
		return firstValueFrom(appConfig.load(config));
		/*
		.then(() => {
		  oAuth2Service.initialize();
		});
		*/
	};
}
