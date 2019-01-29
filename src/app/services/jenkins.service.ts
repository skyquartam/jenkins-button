import {Injectable} from "@angular/core";
import {HttpClient, HttpRequest, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {map, tap, concatMap, filter} from "rxjs/operators";
import {IJenkinsJob, IJenkinsView} from "jenkins-api-ts-typings";

export interface JenkinsJob {
  name: string;
  url: string;
  color: "blue" | "red" | "disabled" | "blue_anime";
}

export interface Credentials {
  username: string;
  password: string;
}

export interface JenkinsUser {
  id: string;
  fullName: string;
  absoluteUrl: string;
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
  private currentUser: JenkinsUser;
  public views: IJenkinsView[] = [];

  constructor(private http: HttpClient) {
  }

  logout() {
    this.credentials = null;
    this.currentUser = null;
  }

  loadJobs(): Observable<IJenkinsView[]> {
    return this.loadJobsWithCredentials(this.credentials)
  }

  loadJobsWithCredentials(credentials: Credentials): Observable<IJenkinsView[]> {
    this.credentials = credentials;
    return this.getJenkinsCrumb(credentials).pipe(
      concatMap(crumbResponse => this.http.get<{ views: IJenkinsView[] }>(`http://svilmiwcmsapp01.sky.local/jenkins/api/json?depth=2&tree=views[name,url,jobs[name,healthReport[iconUrl],color,builds[estimatedDuration,displayName,duration]{0}]]`, this.getAuthHeaders(credentials, crumbResponse))),
      map(viewResponse => viewResponse.views),
      map( views => views.sort((v1,_) => v1.name == "Sport" ? -1 : undefined)),
      map( views => views.filter(v => v.name != "6.2")),
      tap(views => this.views = views)
    )
  }

  getUser(): Observable<JenkinsUser> {
    if (this.currentUser != null) {
      return of(this.currentUser);
    } else {
      return this.getJenkinsCrumb(this.credentials).pipe(
        concatMap(crumbResponse => this.http.get<JenkinsUser>(`http://svilmiwcmsapp01.sky.local/jenkins/user/${this.credentials.username}/api/json`, this.getAuthHeaders(this.credentials, crumbResponse))),
        tap(u => this.currentUser = u)
      )
    }
  }

  buildJob(url: string): Observable<void> {
    return this.getJenkinsCrumb(this.credentials).pipe(
      concatMap(crumbResponse => this.http.post<void>(`${url}/build`, {}, this.getAuthHeaders(this.credentials, crumbResponse))),
    )
  }

  private getJenkinsCrumb(credentials: Credentials): Observable<CrumbResponse> {
    return this.http.get<CrumbResponse>(`http://svilmiwcmsapp01.sky.local/jenkins/crumbIssuer/api/json`, this.getAuthHeaders(credentials));
  }

  private getAuthHeaders(credentials: Credentials, crumbData?: CrumbResponse): { headers: { Authorization: string } } {
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
