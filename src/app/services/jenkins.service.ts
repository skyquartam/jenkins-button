import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {map, tap} from "rxjs/operators";

export interface JenkinsJob {
  name: string;
  url: string;
}

@Injectable({
  providedIn: "root"
})
export class JenkinsService {

  jobs: JenkinsJob[];

  readonly SVIL_JOB_NAME = "ita-wcmsaem-6.0-skysporthd(build-sonar)";
  readonly JENKINS_TOKEN = "110a2b74cacdf5c0c0970565221eae06";
  readonly API_TOKEN = "8a5ab3bd655d4155061c0973882e9ff6";
  jenkins: any;

  constructor(private http: HttpClient) {}

  getPipelines(): Observable<JenkinsJob[]> {
    return this.http.get<{jobs: JenkinsJob[]}>(`http://quartam:${this.API_TOKEN}@svilmiwcmsapp01.sky.local/jenkins/view/Sport/api/json`).pipe(
      map( res => res.jobs),
      tap(jobs => this.jobs = jobs)
    );
  }

  build(url: string): Observable<void> {
    return this.http.post<void>(`${url}/build?token=${this.API_TOKEN}`, {}, {
      headers: {
        // "Jenkins-Crumb": this.JENKINS_TOKEN,
        Authorization: "Basic " + btoa("quartam:" + this.API_TOKEN)
      }
    });
  }
}
