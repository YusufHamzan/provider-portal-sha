import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { PageRequest, defaultPageRequest } from "../../query-params/page-request";
import { Page } from "../../models/page";
import { http } from "../../http.client";

export class BenefitService {

    readonly QUERY_CONTEXT = `master-data-service/v1/benefits`;
    readonly PROVIDER_QUERY_CONTEXT = `/provider-query-service/v1/providers`;
    readonly BENEFIT_QUERY_CONTEXT = `benefit-structure-query-service/v1/benefitstructures`;
    // ?memberId=1248216841788071936&policyNumber=PN277084000

    getProviders(pageRequest: any): Observable<Page<any>> {
        return http
          .get<Page<any>>(`${this.PROVIDER_QUERY_CONTEXT}`, { params: pageRequest })
          .pipe(map(response => response.data));
      }
    getAllBenefit(
        pageRequest: PageRequest = defaultPageRequest
    ): Observable<Page<any>> {
        return http
            .get<Page<any>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }
    getAllBenefitWithChild(pageRequest: PageRequest = defaultPageRequest): Observable<Page<any>> {
        return http
          .get<Page<any>>(`${this.BENEFIT_QUERY_CONTEXT }/sha/master/benefits`, { params: pageRequest })
          .pipe(map(response => response.data));
      }
    getBenefitInterventions(id: string): Observable<Page<any>> {
        return http
          .get<Page<any>>(`${this.BENEFIT_QUERY_CONTEXT }/benifit-intervention/${id}`)
          .pipe(map(response => response.data));
      }

    getBenefitParameterDetails(benefitCode: string): Observable<Page<any>> {
        return http
            .get<Page<any>>(`${this.QUERY_CONTEXT}/${benefitCode}`)
            .pipe(map((response) => response.data));
    }
}
