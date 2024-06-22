import { Observable, of } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { Page } from "../../models/page";

export class MemberService {
  readonly COMMAND_CONTEXT = `/member-command-service/v1/members`;
  readonly QUERY_CONTEXT = `/member-query-service/v1/members`;

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
      key: "policy_number",
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
          responseType: "blob",
        }
      )
      .pipe(map((response) => response.data));
  }
  getMemberBalance(id: any): Observable<Page<any>> {
    return http.get<Page<any>>(`${this.QUERY_CONTEXT}/balance?membershipNo=${id}`).pipe(map(response => response.data));
  }

  getValidate(payload: any): Observable<Page<any>> {
    return http.post<Page<any>>(`http://10.64.6.100:11010/sharules/validate`,  payload ).pipe(
      map(response => response.data)
    );
  }

  getDecsion(id: any): Observable<Page<any>> {
    return http.get<Page<any>>(`http://10.64.6.100:11010/sharules/show-decission/${id}` ).pipe(
      map(response => response.data)
    );
  }
  
}
