import { Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { OrgNode } from '../models/org-node.model';
import { BaseService ,unwrapApiResponse} from './base.service';
import { ConfigService } from '../services/config.service';
import { CommonUtil } from '../utilities/common.util';
import { LoggerService } from '../services/logger.service';
@Injectable({
  providedIn: 'root'
})
export class OrgNodeService extends BaseService<OrgNode> {
 	/**
	 * Updates or merges custom HTTP headers for a specific interceptor URL group.
	 * @param http Updates or merges custom HTTP headers for a specific interceptor URL group.
	 * @param config Updates or merges custom HTTP headers for a specific interceptor URL group.
	 */


	constructor(
		public override http: HttpClient,
		@Inject('CONFIG') private readonly config: ConfigService,
		loggerService: LoggerService
	) {
		super(http,loggerService);
	}
	/**
	 * Updates or merges custom HTTP headers for a specific interceptor URL group.
	 * @returns Updates or merges custom HTTP headers for a specific interceptor URL group.
	 */
	getServiceUrl(): string {
		const url = CommonUtil.getApiUrl('USERS_EP', this.config);
		if (!url) {
			throw new Error('ROLES_EP URL not found in config');
		}
		return url;
	}
	
	getChildNodes(
  parentId: string
  ,mode:string
): Observable<OrgNode[]> {
  const finalUrl = `${this.getServiceUrl()}?mode=${mode}&parentId=${parentId}`;

  return this.http
    .get<ApiResponse<OrgNode[]>>(finalUrl)
    .pipe(
      tap(res => this.logger.debug('RAW getUserRoles response:', res)),
      unwrapApiResponse<OrgNode[]>()
    );
}

searchChildren(input : string,mode: string): Observable<OrgNode[]> {
 const finalUrl = `${this.getServiceUrl()+'/search'}?mode=${mode}&searchTerm=${input}`;
/*
   const options = { headers: this.getOptionsWithToken('token').headers };
  const isArray = Array.isArray(data);
  const url = this.getServiceUrl() + (isArray ? '/addUserRoles' : '/addUserRole');

  return this.http
    .post<ApiResponse<UserRoleResponse>>(url, data, options)
    .pipe(
      unwrapApiResponse<UserRoleResponse>()
    );
	*/
	return this.http
    .get<ApiResponse<OrgNode[]>>(finalUrl)
    .pipe(
      tap(res => this.logger.debug('RAW getUserRoles response:', res)),
      unwrapApiResponse<OrgNode[]>()
    );
}
searchByRange(): Observable<OrgNode[]> {
 const finalUrl = `${this.getServiceUrl()+'/searchByRange'}`;
/*
   const options = { headers: this.getOptionsWithToken('token').headers };
  const isArray = Array.isArray(data);
  const url = this.getServiceUrl() + (isArray ? '/addUserRoles' : '/addUserRole');

  return this.http
    .post<ApiResponse<UserRoleResponse>>(url, data, options)
    .pipe(
      unwrapApiResponse<UserRoleResponse>()
    );
	*/
	return this.http
    .get<ApiResponse<OrgNode[]>>(finalUrl)
    .pipe(
      tap(res => this.logger.debug('RAW getUserRoles response:', res)),
      unwrapApiResponse<OrgNode[]>()
    );
}

searchByRangeThreeLevels(): Observable<OrgNode[]> {
 const finalUrl = `${this.getServiceUrl()+'/searchByRangeThreeLevels'}`;
/*
   const options = { headers: this.getOptionsWithToken('token').headers };
  const isArray = Array.isArray(data);
  const url = this.getServiceUrl() + (isArray ? '/addUserRoles' : '/addUserRole');

  return this.http
    .post<ApiResponse<UserRoleResponse>>(url, data, options)
    .pipe(
      unwrapApiResponse<UserRoleResponse>()
    );
	*/
	return this.http
    .get<ApiResponse<OrgNode[]>>(finalUrl)
    .pipe(
      tap(res => this.logger.debug('RAW getUserRoles response:', res)),
      unwrapApiResponse<OrgNode[]>()
    );
}
}