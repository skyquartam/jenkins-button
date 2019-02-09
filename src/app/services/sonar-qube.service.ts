import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class SonarQubeService {

  readonly baseUrl = "http://svilmiwcmsapp01.sky.local/sonar";

  constructor(private http: HttpClient) {
  }

  getCoverage(component: string): Observable<SonarQube.Coverage.History> {
    return this.http.get<SonarQube.Coverage.APIResponse>(`${this.baseUrl}/api/measures/search_history?component=${component}&metrics=coverage`).pipe(
      map(r => r.measures[0].history[r.measures[0].history.length - 1])
    );
  }

  getTechDebt(component: string): Observable<SonarQube.Issues.APIResponse> {
    return this.http.get<SonarQube.Issues.APIResponse>(`${this.baseUrl}/api/issues/search?componentKeys=${component}&facetMode=effort&resolved=false&types=CODE_SMELL&facets=severities%2Ctypes`);
  }

}
