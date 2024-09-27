import { Observable } from 'rxjs/';
import { map } from 'rxjs/operators';
import {
	PageRequest,
	defaultPageRequest,
} from '../../query-params/page-request';
import { Page } from '../../models/page';
import { http } from '../../http.client';

export class RetailUserService {
	readonly QUERY_CONTEXT = `master-data-service/v1`;

	fetchAndSaveMemberDetails(pageRequest: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}/retail-users/create-sha-member`, {
				params: pageRequest,
			})
			.pipe(map((response) => response.data));
	}
}
