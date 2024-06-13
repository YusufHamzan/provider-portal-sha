import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { Page } from "../../models/page";
import { PageRequest, defaultPageRequest } from "../../query-params/page-request";

export class CountryService {
  readonly COMMAND_CONTEXT = `/master-data-service/v1/countries`;
  readonly QUERY_CONTEXT = `/master-data-service/v1/countries`;

  getCountryList(
    pageRequest: PageRequest = defaultPageRequest
  ): Observable<Page<any>> {
    return http
      .get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }

  getStatesList(
    countryCode: any
  ): Observable<Array<any>> {
    return http
      .get<Array<any>>(`${this.QUERY_CONTEXT}/` + countryCode + `/states`)
      .pipe(map((response) => response.data));
  }
}
