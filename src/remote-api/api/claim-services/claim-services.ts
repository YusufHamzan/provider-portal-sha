// https://api.eoxegen.com/claim-query-service/v1/integration/preauths/allPreAuthClaims?membershipNos=STV/RTC/3/04/2024&membershipNos=STV/RTC/1/04/2024&membershipNos=STV/RTC/5/04/2024&membershipNos=STV/RTC/2/04/2024&membershipNos=STV/RTC/4/04/2024&membershipNos=STV/RTC/5/04/2024
// http://localhost:8101/v1/policies?page=0&size=10&summary=true&active=true&clientId=1225672305528369152
import { Observable, of } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { Page } from "../../models/page";
import { Reimbursement } from "../../models/reimbursement";

export class ClaimService {
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

  getDashboardCountClaims(id:any): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/provider/reimbursements/dashboard-count/${id}`)
      .pipe(map((response) => response));
  }

  getClaimReim(pageRequest: any, providerId: number): Observable<any> {
    return http
      .get<Page<any>>(
        `${this.QUERY_CONTEXT}/provider/reimbursements/preauth-details/${providerId}`,
        // provider/reimbursements/preauth-details/1233358561196470272?page=0&size=10&summary=true&active=true
        { params: pageRequest }
      )
      .pipe(map((response) => response));
  }
  
  getClaimdata(pageRequest: any, providerId: number): Observable<any> {
    return http
      .get<Page<any>>(
        `${this.QUERY_CONTEXT}/provider/reimbursements/claim-credit/date-filter`,
        // provider/reimbursements/preauth-details/1233358561196470272?page=0&size=10&summary=true&active=true
        { params: pageRequest }
      )
      .pipe(map((response) => response));
  }

  getFilteredClaimReim(pageRequest: any, providerId: number): Observable<any> {
    return http
      .get<Page<any>>(
        `${this.QUERY_CONTEXT}/provider/reimbursements/preauth-claim-filter/reimbursement`,
        { params: pageRequest }
      )
      .pipe(map((response) => response));
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

  importReimbursementData(pagerqsts: any): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pagerqsts })
      .pipe(map((response) => response.data));
  }

  saveReimbursement(payload: Reimbursement, providerId:string): Observable<Map<string, any>> {
    return http
      .post<Map<string, any>>(`${this.COMMAND_CONTEXT}/provider/reimburse/${providerId}`, payload)
      .pipe(map((response) => response.data));
  }

  getReimbursementById(id: string, providerId:string): Observable<Reimbursement> {
    return http
      .get<Reimbursement>(`${this.QUERY_CONTEXT}/provider/reimbursements/${id}/${providerId}`)
      .pipe(map((response) => response.data));
  }

  editReimbursement(
    payload: any,
    id: string,
    action: string,
    providerId: string,
  ): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}/provider/reimburse/${id}/${providerId}`, payload, {
        params: { action: action },
      })
      .pipe(map((response) => response.data));
  }

  editDoctorsOpinion(id: string, payload: any): Observable<Map<string, any>> {
    return http
      .put<Map<string, any>>(
        `${this.COMMAND_CONTEXT}/${id}/opinion-diagnosis`,
        payload
      )
      .pipe(map((response) => response.data));
  }

  addDoc(id: string, payload: FormData, providerId: string,): Observable<Map<string, any>> {
    let headers = { "Content-Type": "multipart/form-data" };
    return http
      .put<Map<string, any>>(`${this.COMMAND_CONTEXT}/provider/reimburse/${id}/docs/${providerId}`, payload, {
        headers,
      })
      .pipe(map((response) => response.data));
  }

  downloadDoc(id: string, fileName: string): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/${id}/docs/${fileName}`, {
        responseType: "blob",
      })
      .pipe(map((response) => response));
  }

  auditDecision(claimId: string, payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(
        `${this.COMMAND_CONTEXT}/${claimId}/audits`,
        payload
      )
      .pipe(map((response) => response.data));
  }

  getReadyToProcessReimbursements(
    pageRequest: any
  ): Observable<Page<Reimbursement>> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}/claims-ready-to-process`, {
        params: pageRequest,
      })
      .pipe(map((response) => response.data));
  }

  getAllAuditReimbursements(pageRequest: any): Observable<Page<Reimbursement>> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}/audits`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }

  getAllDashboardCount(id: any): Observable<Page<Reimbursement>> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}/integration/preauths/claim-dashboard-count/${id}`)
      .pipe(map((response) => response.data));
  }
}
