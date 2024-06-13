import { Observable } from "rxjs/";
import { map } from "rxjs/operators";
import { http } from "../../http.client";

export class AddressService {
  readonly COMMAND_CONTEXT = `master-data-service/v1/addressfieldconfigurations`;
  readonly QUERY_CONTEXT = `master-data-service/v1/addressfieldconfigurations`;
  readonly DEFAULT_QUERY = `master-data-service/v1`


  saveAddress(payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload)
      .pipe(map((response) => response.data));
  }

  updateAddress(payload: any): Observable<Map<string, any>> {
    return http
      .patch<Map<string, any>>(`${this.COMMAND_CONTEXT}`, payload)
      .pipe(map((response) => response.data));
  }

  getAddressConfig(): Observable<any> {
    return http
      .get<any>(`${this.QUERY_CONTEXT}`, { params: { type: "ADDRESS" } })
      .pipe(map((response) => response.data));
  }


  getSourceList(url: any): Observable<Array<any>> {
    return http
      .get<Array<any>>(`${this.DEFAULT_QUERY}` + url)
      .pipe(map((response) => response.data));
  }


}
