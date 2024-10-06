import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { Page } from "../../models/page";
import { delay, tap } from "rxjs/operators";

// /sha-member-onboard-service/v1/member-onboard/?nid={nationalId} --- > GET
let requestCount = 0;

export class MemberOnboardServices {
  readonly CONTEXT = `/sha-member-onboard-service/v1/member-onboard`;

//   getMemberByNatinalId(pageRequest: any): Observable<any> {
//     requestCount++;
//     console.log("count ", requestCount);

//     const mockData =
//       requestCount === 4
//         ? { content: [{ id: 1, name: "John Doe", nationalId: "123456789" }] }
//         : { content: [] };

//     if (requestCount === 4) requestCount = 0;

//     return of({ data: mockData }).pipe(
//       delay(500),
//       tap(() => console.log(`Request count: ${requestCount}`)),
//       map((response: { data: any }) => response.data)
//     );
//   }

//   createMemberByNatinalId(payload: {
//     nationalId: string | number;
//   }): Observable<any> {
//     const mockResponse = {
//       data: { id: 1, name: "John Doe", nationalId: payload.nationalId },
//     };

//     return of(mockResponse).pipe(
//       delay(500), // 3 seconds delay
//       map((response: { data: any }) => response.data)
//     );
//   }

  getMemberByNatinalId(
  	pageRequest: any,
  ): Observable<Page<any>> {
  	return http
  		.get<Page<any>>(`${this.CONTEXT}`, {
  			params: pageRequest,
  		})
  		.pipe(map((response: { data: any }) => response.data));
  }

  createMemberByNatinalId(
  	payload: {nationalId: string | number},
  ): Observable<Page<any>> {
  	return http
  		.post<Page<any>>(`${this.CONTEXT}`, payload)
  		.pipe(map((response: { data: any }) => response.data));
  }
}
