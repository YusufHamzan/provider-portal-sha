import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";
import { CleintType } from "../../models/client.type";
import { Page } from "../../models/page";
import { PageRequest, PageRequestServicegrouping, PageRequestServices, defaultPageRequest, defaultPageRequestServiceGrouping, defaultPageRequestServices } from "../../query-params/page-request";

export class ServiceTypeService {
    readonly QUERY_CONTEXT = `/master-data-service/v1/servicetypes`;

    getServiceTypes(
        pageRequest: PageRequest = defaultPageRequest
    ): Observable<Page<CleintType>> {
        return http
            .get<Page<CleintType>>(`${this.QUERY_CONTEXT}`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }

    getExpenseHead(
        serviceId: string,
        pageRequest: PageRequest = defaultPageRequest
    ): Observable<Page<CleintType>> {
        return http
            .get<Page<CleintType>>(`${this.QUERY_CONTEXT}/${serviceId}/services`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }

    getServiceGroupes(
        serviceId: string,
        pageRequest: PageRequestServicegrouping = defaultPageRequestServiceGrouping,
    ): Observable<Page<CleintType>> {
        return http
            .get<Page<CleintType>>(`${this.QUERY_CONTEXT}/${serviceId}/servicegroups`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }

    getServices(
        serviceId: string,
        serviceGroupId: string,
        pageRequest: PageRequestServices = defaultPageRequestServices,
    ): Observable<Page<CleintType>> {
        return http
            .get<Page<CleintType>>(`${this.QUERY_CONTEXT}/${serviceId}/services?service-group-id=${serviceGroupId}`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }

    getServicesbyId(
        serviceId: string,
        pageRequest: PageRequestServices = defaultPageRequestServices,
    ): Observable<Page<CleintType>> {
        return http
            .get<Page<CleintType>>(`${this.QUERY_CONTEXT}/${serviceId}/services`, { params: pageRequest })
            .pipe(map((response) => response.data));
    }


}