import { Observable } from 'rxjs/';
import { map } from 'rxjs/operators';
import { http } from '../../http.client';
import { CleintType } from '../../models/client.type';
import { Page } from '../../models/page';
import { PageRequest, defaultPageRequest } from '../../query-params/page-request';

export class ProviderTypeService {
  readonly COMMAND_CONTEXT = `/master-data-service/v1/providertypes`;
  readonly QUERY_CONTEXT = `/master-data-service/v1/public/providertypes`;
  readonly QUERY_CONTEXT1 = `/master-data-service/v1/providerownertypes`;
  readonly QUERY_CATEGORY = `/master-data-service/v1/categories`;
  getProviderTypes(pageRequest: PageRequest = defaultPageRequest): Observable<Page<CleintType>> {
    return http
      .get<Page<CleintType>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map(response => response.data));
  }
  getProviderOwnerTypes(pageRequest: PageRequest = defaultPageRequest): Observable<Page<CleintType>> {
    return http
      .get<Page<CleintType>>(`${this.QUERY_CONTEXT1}`, { params: pageRequest })
      .pipe(map(response => response.data));
  }
  addProviderOwnerType(payload: any): Observable<Page<CleintType>> {
    return http.post<Page<CleintType>>(`${this.QUERY_CONTEXT1}`, payload).pipe(map(response => response.data));
  }
  getProviderCategory(pageRequest: PageRequest = defaultPageRequest): Observable<Page<CleintType>> {
    return http
      .get<Page<CleintType>>(`${this.QUERY_CATEGORY}`, { params: pageRequest })
      .pipe(map(response => response.data));
  }
  addProviderCategoryType(payload: any): Observable<Page<CleintType>> {
    return http.post<Page<CleintType>>(`${this.QUERY_CATEGORY}`, payload).pipe(map(response => response.data));
  }
  addProviderType(payload: any): Observable<Page<CleintType>> {
    return http.post<Page<CleintType>>(`${this.QUERY_CONTEXT}`, payload).pipe(map(response => response.data));
  }
}
