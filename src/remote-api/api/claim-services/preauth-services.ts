// https://api.eoxegen.com/claim-query-service/v1/integration/preauths/allPreAuthClaims?membershipNos=STV/RTC/3/04/2024&membershipNos=STV/RTC/1/04/2024&membershipNos=STV/RTC/5/04/2024&membershipNos=STV/RTC/2/04/2024&membershipNos=STV/RTC/4/04/2024&membershipNos=STV/RTC/5/04/2024
// http://localhost:8101/v1/policies?page=0&size=10&summary=true&active=true&clientId=1225672305528369152
import { Observable, of } from 'rxjs/';
import { map } from 'rxjs/operators';
import { http } from '../../http.client';
import { Page } from '../../models/page';

// let providerId = localStorage.getItem("providerId");

export class PreAuthService {
	readonly COMMAND_CONTEXT = `/claim-command-service/v1`;
	readonly QUERY_CONTEXT = `/claim-query-service/v1`;

	getMembers(pageRequest: any, prospectId: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}`, {
				params: {
					// pageRequest: { ...pageRequest },
					prospectId,
				},
			})
			.pipe(map((response: { data: any }) => response.data));
	}

	getAllPreauth(pageRequest: any, id: number): Observable<any> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}/provider/preauths/${id}`, {
				params: pageRequest,
			})
			.pipe(map((response) => response));
	}

	getFilteredPreauth(pageRequest: any, id: number): Observable<any> {
		return (
			http
				.get<Page<any>>(
					`${this.QUERY_CONTEXT}/provider/preauths/provider-poartal/filter`,
					{ params: pageRequest }
				)

				// /provider/preauths/${id}`, { params: pageRequest })
				.pipe(map((response) => response))
		);
	}

	getAdvancedFilteredPreauth(pageRequest: any, id: number): Observable<any> {
		return (
			http
				.get<Page<any>>(
					`${this.QUERY_CONTEXT}/provider/preauths/provider-poartal/date-filter`,
					{ params: pageRequest }
				)

				// /provider/preauths/${id}`, { params: pageRequest })
				.pipe(map((response) => response))
		);
	}

	getDashboardCount(id: any): Observable<any> {
		return http
			.get<any>(
				`${this.QUERY_CONTEXT}/preauths/dashboard-count-provider-poartal/${id}`
			)
			.pipe(map((response) => response));
	}

	getPreAuthList(pageRequest: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
			.pipe(map((response) => response.data));
	}

	changeStatus(
		id: any,
		claimType: any,
		payload: any
	): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/${id}/claimworkflow`,
				payload,
				{ params: { claimType: claimType } }
			)
			.pipe(map((response) => response.data));
	}

	changeStat(id: any, status: any) {
		return http
			.patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/${id}`, {
				params: { action: status },
			})
			.pipe(map((response) => response.data));
	}

	importPreAuthData(pagerqsts: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pagerqsts })
			.pipe(map((response) => response.data));
	}

	savePreAuth(payload: any, id: number): Observable<Map<string, any>> {
		return http
			.post<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/provider/preauths/${id}`,
				payload
			)
			.pipe(map((response) => response.data));
	}

	getPreAuthById(id: string, providerId: any): Observable<any> {
		return http
			.get<any>(`${this.QUERY_CONTEXT}/provider/preauths/${id}/${providerId}`)
			.pipe(map((response) => response.data));
	}

	cancelPreAuth(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/${id}/cancel`, payload)
			.pipe(map((response) => response.data));
	}

	revertPreAuth(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/${id}/revert`, payload)
			.pipe(map((response) => response.data));
	}

	requestMoreDocsPreAuth(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/${id}?action=add-docx`, payload)
			.pipe(map((response) => response.data));
	}

	editPreAuth(
		payload: any,
		id: string,
		action: string,
		providerId: string
	): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/provider/preauths/${id}/${providerId}`,
				payload,
				{ params: { action: action } }
			)
			.pipe(map((response) => response.data));
	}

	addDoc(
		id: string,
		payload: FormData,
		pId: number
	): Observable<Map<string, any>> {
		let headers = { 'Content-Type': 'multipart/form-data' };
		return http
			.put<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/provider/preauths/${id}/docs/${pId}`,
				payload,
				{ headers }
			)
			.pipe(map((response) => response.data));
	}

	addDocAfterReviw(id: string, payload: any): Observable<Map<string, any>> {
		return http
			.patch<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/preauths/${id}?action=add-doc-submit`,
				payload
			)
			.pipe(map((response) => response.data));
	}

	downloadDoc(id: string, fileName: string): Observable<any> {
		return http
			.get<any>(`${this.QUERY_CONTEXT}/${id}/docs/${fileName}`, {
				responseType: 'blob',
			})
			.pipe(map((response) => response));
	}
	downloadDischargeDocs(
		id: string,
		payload: FormData
	): Observable<Map<string, any>> {
		let headers = { 'Content-Type': 'multipart/form-data' };
		return http
			.put<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/${id}/discharge-docs`,
				payload,
				{ headers }
			)
			.pipe(map((response) => response.data));
	}

	admissionUpdate(id: string, payload: any): Observable<Map<string, any>> {
		return http
			.put<Map<string, any>>(
				`${this.COMMAND_CONTEXT}/${id}/case-managements`,
				payload
			)
			.pipe(map((response) => response.data));
	}

	getCaseList(): Observable<any> {
		return http
			.get<any>(`${this.QUERY_CONTEXT}/case-managements/count`)
			.pipe(map((response) => response));
	}

	getCaseStatusList(pageRequest: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(
				`${this.QUERY_CONTEXT}/case-managements/list-by-duration-and-status`,
				{ params: pageRequest }
			)
			.pipe(map((response) => response.data));
	}

	getHospitalVisitList(preAuthId: string): Observable<any> {
		return http
			.get<any>(`${this.QUERY_CONTEXT}/${preAuthId}/case-managements/history`)
			.pipe(map((response) => response));
	}

	getClaimsByBenefit(benefitId: any, membershipNo: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(
				`${this.QUERY_CONTEXT}/claims-by-benefit?benefitId=${benefitId}&membershipNo=${membershipNo}`
			)
			.pipe(map((response) => response.data));
	}

	generateOTP(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/${id}/otp`, payload)
			.pipe(map((response) => response.data));
	}
	verifyOTP(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/${id}/otp/verify`, payload)
			.pipe(map((response) => response.data));
	}
}
