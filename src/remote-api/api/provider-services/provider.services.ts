import { Observable } from 'rxjs/';
import { map } from 'rxjs/operators';
import { http } from '../../http.client';
import { Page } from '../../models/page';
import { Provider } from '../../models/provider';
import {
	ProviderPageRequest,
	ProspectRequestQueryParam,
} from '../../query-params';

export class ProvidersService {
	readonly COMMAND_CONTEXT = `/provider-command-service/v1/public/providers`;
	readonly QUERY_CONTEXT = `/provider-query-service/v1/providers`;

	getProviders(pageRequest: any): Observable<Page<Provider>> {
		return http
			.get<Page<Provider>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
			.pipe(map((response) => response.data));
	}
	getParentProviders(
		pageRequest: ProspectRequestQueryParam = ProviderPageRequest
	): Observable<Page<Provider>> {
		return http
			.get<Page<Provider>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
			.pipe(map((response) => response.data));
	}
	saveProvider(payload: Provider): Observable<Map<string, any>> {
		return http
			.post<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload)
			.pipe(map((response) => response.data));
	}

	getProviderDetails(providerid: string): Observable<Provider> {
		return http
			.get<Provider>(`${this.QUERY_CONTEXT}/${providerid}`)
			.pipe(map((response) => response.data));
	}

	editProvider(
		payload: Provider,
		providerid: string,
		step: string
	): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/${providerid}`,
				payload,
				{ params: { step: step } }
			)
			.pipe(map((response) => response.data));
	}

	blacklistProvider(payload: any): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/blacklist`, payload)
			.pipe(map((response) => response.data));
	}

	unblacklistProvider(payload: any): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/unblacklist`, payload)
			.pipe(map((response) => response.data));
	}

	categorizeProvider(payload: any): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/category`, payload)
			.pipe(map((response) => response.data));
	}

	verifyImage(id: string, payload: FormData): Observable<Map<string, any>> {
		let headers = { "Content-Type": "multipart/form-data" };
		return http
			.post<Map<string, any>>(`${this.QUERY_CONTEXT}/verify?memberId=${id}`, payload, {
				headers,
			  })
			.pipe(map((response) => response.data));
	}
}
