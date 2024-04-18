import { Observable } from 'rxjs/';
import { map } from 'rxjs/operators';
import { http } from '../../http.client';
import { CleintType } from '../../models/client.type';
import { Page } from '../../models/page';
import {
	defaultPageRequest,
	PageRequest,
} from './../../query-params/page-request';

export class ProviderTypeService {
	readonly COMMAND_CONTEXT = `/master-data-service/v1/providertypes`;
	readonly QUERY_CONTEXT = `/master-data-service/v1/providertypes`;

	getProviderTypes(
		pageRequest: PageRequest = defaultPageRequest
	): Observable<Page<CleintType>> {
		return http
			.get<Page<CleintType>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
			.pipe(map((response) => response.data));
	}
}
