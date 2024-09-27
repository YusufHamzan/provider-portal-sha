import { Observable, of } from 'rxjs/';
import { map } from 'rxjs/operators';
import { http } from '../../http.client';
import { Page } from '../../models/page';

export class MemberService {
	readonly COMMAND_CONTEXT = `/member-command-service/v1`;
	readonly QUERY_CONTEXT = `/member-query-service/v1/members`;
	readonly QUERY_CONTEXT2 = `/member-query-service/v1`;

	getMember(pageRequest: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
			.pipe(map((response) => response.data));
	}

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

	getMembersByPolicy(
		pageRequest: any,
		policyNumber: string
	): Observable<Page<any>> {
		const queryParams = {
			...pageRequest,
			key: 'policy_number',
			value: policyNumber,
		};
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}`, {
				params: { ...queryParams },
			})
			.pipe(map((response: { data: any }) => response.data));
	}
	getMemberImage(id: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}/member-docs-details/${id}`)
			.pipe(map((response) => response.data));
	}
	getMemberImageType(memberID: string, docName: String): Observable<any> {
		return http
			.get<any>(
				`${this.QUERY_CONTEXT}/${memberID}/member-docs/${docName}?attatched=true`,
				{
					responseType: 'blob',
				}
			)
			.pipe(map((response) => response.data));
	}
	getMemberBalance(id: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}/balance?membershipNo=${id}`)
			.pipe(map((response) => response.data));
	}

	getValidate(payload: any): Observable<Page<any>> {
		return http
			.post<Page<any>>(
				`https://api.eoxegen.com/sha-rule-service/sharules/validate`,
				payload
			)
			.pipe(map((response) => response.data));
	}

	getDecsion(id: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(
				`https://api.eoxegen.com/sha-rule-service/sharules/show-decission/${id}`
			)
			.pipe(map((response) => response.data));
	}

	getBiometric(id: any): Observable<Page<any>> {
		return http
			.get<Page<any>>(`${this.QUERY_CONTEXT}/${id}/biometric`)
			.pipe(map((response) => response.data));
	}
	generateOTP(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(
				`${this.COMMAND_CONTEXT}/member-plan-update/${id}/otp`,
				payload
			)
			.pipe(map((response) => response.data));
	}
	verifyOTP(payload: any, id: string): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/${id}/otp/verify`, payload)
			.pipe(map((response) => response.data));
	}

	initiateBiometric(payload: any): Observable<any> {
		return http
			.post<any>(`${this.COMMAND_CONTEXT}/sha-member/biometric`, payload)
			.pipe(map((response) => response.data));
	}

	biometricStatus(id: any): Observable<any> {
		return http
			.get<any>(`${this.QUERY_CONTEXT2}/sha-member/biometric?id=${id}`)
			.pipe(map((response) => response.data));
	}

	initiateContribution(memberId, nationalId): Observable<any> {
		return http
			.patch<any>(`${this.COMMAND_CONTEXT}/member-plan-update/${memberId}/${nationalId}/contribution`, {})
			.pipe(map((response) => response.data));
	}
}
