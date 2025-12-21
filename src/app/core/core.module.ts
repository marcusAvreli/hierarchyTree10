import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
	APP_INITIALIZER,
	Inject,
	ModuleWithProviders,
	NgModule,
	Optional,
	SkipSelf
} from '@angular/core';

import { IHttpConfig } from './models/http-config.interface';
import { propertiesResolverFactory } from './properties-resolver.factory';
import { ConfigService } from './services/config.service';
//import {TreeUtilsService} from './services/tree-utils.service';
//import { EntityQueueService } from './services/entity-queue.service';
//import { EventBusService } from './services/event-bus.service';
//import { PermissionService } from './services/permission.service';
////import { ReportService } from './services/report.service';
////import { RoleService } from './services/role.service';
//import {UserRoleService} from './domain/user-role/user-role.service';
//import { RoleService } from './domain/role/role.service';
//import {RoleApiService}  from './backend/role-api.service';
//import { ToastService } from './services/toast.service';
//import { UserService } from './services/user.service';
//import {Report2ApiService} from './backend/report2-api.service';
//import {ErrorCodeApiService} from './backend/error-code-api.service'; 
import { LOGGER_CONFIG, LoggerConfig } from './tokens/logger-config.token';
import { LoggerService } from './services/logger.service';
import {ViewportService} from './services/viewport.service';
/**
 * Cleans up the subscription when the component is destroyed.
 */
@NgModule({
	imports: [CommonModule, HttpClientModule]
})
export class CoreModule {
	/**
	 * Cleans up the subscription when the component is destroyed.
	 * @param parentModule Cleans up the subscription when the component is destroyed.
	 */
	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		if (parentModule) {
			throw new Error('CoreModule is already loaded. Import it in the AppModule only');
		}
	}
	/**
	 * Cleans up the subscription when the component is destroyed.
	 * @param config Cleans up the subscription when the component is destroyed.
	 * @returns  Cleans up the subscription when the component is destroyed.
	 */
	static forRoot(config?: IHttpConfig & { logger?: LoggerConfig }): ModuleWithProviders<CoreModule> {
		return {
			ngModule: CoreModule,
			providers: [
			{
          provide: LOGGER_CONFIG,
          useValue: config?.logger ?? { level: 'debug' } // default to 'info'
        },
        LoggerService,
		ViewportService,
		//TreeUtilsService,
				HttpClientModule,

				//				{ provide: HTTP_INTERCEPTORS, useClass: CsrfTokenInterceptor, multi: true },

				ConfigService,
				{ provide: 'CONFIG', useValue: config },
				{
					deps: [ConfigService, [new Inject('CONFIG')]],
					multi: true,
					provide: APP_INITIALIZER,
					useFactory: propertiesResolverFactory
				},


				//,TaskService
				//,PtService
				//UserService,
				//UserRoleService,
				//RoleApiService,
				//RoleService,
				//Report2ApiService,
				//ErrorCodeApiService,
				//PermissionService,
				//EventBusService,
				//ToastService,
				//EntityQueueService,
				//ReportService
				//,SharedService
			]
		};
	}
}
