import { Injectable } from "@angular/core";
import { HttpClient, HttpRequest, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {map, tap, concatMap} from "rxjs/operators";

export interface JenkinsJob {
  name: string;
  url: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface CrumbResponse {
  crumb: string;
  crumbRequestField: string
}

@Injectable({
  providedIn: "root"
})
export class JenkinsService {

  private credentials: Credentials;
  public jobs: JenkinsJob[] = [];

  constructor(private http: HttpClient) {}

  // getPipelines(): Observable<JenkinsJob[]> {
  //   return this.http.get<{jobs: JenkinsJob[]}>(`http://quartam:${this.API_TOKEN}@svilmiwcmsapp01.sky.local/jenkins/view/Sport/api/json`).pipe(
  //     map( res => res.jobs),
  //     tap(jobs => this.jobs = jobs)
  //   );
  // }
  //
  // build(url: string): Observable<void> {
  //   return this.http.post<void>(`${url}/build?token=${this.API_TOKEN}`, {}, {
  //     headers: {
  //       // "Jenkins-Crumb": this.JENKINS_TOKEN,
  //       Authorization: "Basic " + btoa("quartam:" + this.API_TOKEN)
  //     }
  //   });
  // }

  loadJobsWithCredentials(credentials: Credentials): Observable<JenkinsJob[]> {
    this.credentials = credentials
    return this.getJenkinsCrumb(credentials).pipe(
      concatMap(crumbResponse => this.http.get<{jobs: JenkinsJob[]}>(`http://svilmiwcmsapp01.sky.local/jenkins/view/Sport/api/json`, this.getAuthHeaders(credentials, crumbResponse))),
      map(jobResponse => jobResponse.jobs),
      tap(jobs => this.jobs = jobs)
    )
  }

  buildJob(url: string): Observable<void> {
    return this.getJenkinsCrumb(this.credentials).pipe(
      concatMap(crumbResponse => this.http.post<void>(`${url}/build`, this.getAuthHeaders(this.credentials, crumbResponse))),
    )
  }

  private getJenkinsCrumb(credentials: Credentials): Observable<CrumbResponse> {
    return this.http.get<CrumbResponse>(`http://svilmiwcmsapp01.sky.local/jenkins/crumbIssuer/api/json`, this.getAuthHeaders(credentials));
  }

  private getAuthHeaders(credentials: Credentials, crumbData?: CrumbResponse): {headers: {Authorization: string}} {
    const authObj = {
      Authorization: "Basic " + btoa(`${credentials.username}:${credentials.password}`)
    };
    if (crumbData != null) {
      authObj[crumbData.crumbRequestField] = crumbData.crumb;
    }
    return {
      headers: authObj
    };
  }
}
