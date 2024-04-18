// https://api.eoxegen.com/claim-query-service/v1/integration/preauths/allPreAuthClaims?membershipNos=STV/RTC/3/04/2024&membershipNos=STV/RTC/1/04/2024&membershipNos=STV/RTC/5/04/2024&membershipNos=STV/RTC/2/04/2024&membershipNos=STV/RTC/4/04/2024&membershipNos=STV/RTC/5/04/2024
// http://localhost:8101/v1/policies?page=0&size=10&summary=true&active=true&clientId=1225672305528369152
import { Observable, of } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { Page } from "../../models/page";

let providerId = localStorage.getItem("providerId");

export class ClaimService {
  readonly COMMAND_CONTEXT = `/claim-query-service/v1`;
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

  getAllPreauth(pageRequest: any): Observable<any> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}/provider/preauths/${providerId}`, { params: pageRequest })
      .pipe(map((response) => response));
  }

  getClaimReim(pageRequest: any): Observable<any> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}/provider/reimbursements/${providerId}`, { params: pageRequest })
      .pipe(map((response) => response));
  }

  getDashboardCount(): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}/preauths/dashboard-count-provider-poartal/${providerId}`)
      .pipe(map((response) => response));
  }

}
