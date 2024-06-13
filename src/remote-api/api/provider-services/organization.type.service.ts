import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { CleintType } from "../../models/client.type";
import { Page } from "../../models/page";
import { PageRequest, defaultPageRequest } from "../../query-params/page-request";

export class OrganizationTypeService {
  readonly COMMAND_CONTEXT = `/master-data-service/v1/organizationtypes`;
  readonly QUERY_CONTEXT = `/master-data-service/v1/organizationtypes`;

  getOrganizationTypes(
    pageRequest: PageRequest = defaultPageRequest
  ): Observable<Page<CleintType>> {
    return http
      .get<Page<CleintType>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
      .pipe(map((response) => response.data));
  }
}
