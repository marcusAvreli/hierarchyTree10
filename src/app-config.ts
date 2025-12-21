import { IHttpConfig } from './app/core/models/http-config.interface';
import { environment } from './environments/environment';
/** gggg */
export const CONFIG: IHttpConfig = {
	apiUrls: [
		
	
		{ id: 'USERS_EP', url: `${environment.root_api_url}/hello` },
		
		
	]

};
