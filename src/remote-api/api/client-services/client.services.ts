import { Observable, of } from 'rxjs/';
import { map } from 'rxjs/operators';
import { http } from '../../http.client';
import { Page } from '../../models/page';

export class ClientService {
	readonly COMMAND_CONTEXT = `/client-command-service/v1/clients`;
	readonly QUERY_CONTEXT = `/client-query-service/v1/clients`;

	getClientsByMobile(
		pageRequest: any,
		number: string | number
	): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}/search-by-mobile/${number}`, {
				params: pageRequest,
			})
			.pipe(map((response: { data: any }) => response.data));
	}
}
