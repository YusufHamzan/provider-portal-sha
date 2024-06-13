import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { Page } from "../../models/page";

export class StateService {
  readonly COMMAND_CONTEXT = `/master-data-service/v1/states`;
  readonly QUERY_CONTEXT = `/master-data-service/v1/states`;

  getStateList(
    pageRequest: any
  ): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }
}