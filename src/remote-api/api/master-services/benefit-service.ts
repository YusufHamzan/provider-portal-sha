import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { PageRequest, defaultPageRequest } from "../../query-params/page-request";
import { Page } from "../../models/page";
import { http } from "../../http.client";

export class BenefitService {

    readonly QUERY_CONTEXT = `master-data-service/v1/benefits`;

    getAllBenefit(
        pageRequest: PageRequest = defaultPageRequest
    ): Observable<Page<any>> {
        return http
            .get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }

    getBenefitParameterDetails(benefitCode: string): Observable<Page<any>> {
        return http
            .get<Page<any>>(`${this.QUERY_CONTEXT}/${benefitCode}`)
            .pipe(map((response) => response.data));
    }
}
