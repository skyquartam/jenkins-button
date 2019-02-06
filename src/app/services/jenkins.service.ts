import {Injectable} from "@angular/core";
import {HttpClient, HttpRequest, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {map, tap, concatMap, filter} from "rxjs/operators";
import {IJenkinsJob, IJenkinsView} from "jenkins-api-ts-typings";
import {StorageService} from "./storage.service";
import {fromPromise} from "rxjs/internal-compatibility";

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

  private currentUser: JenkinsUser;

  private baseUrl = "http://svilmiwcmsapp01.sky.local/jenkins";
  private credentials: Credentials;
  private crumbData: CrumbResponse;

  constructor(private http: HttpClient, private storageService: StorageService) {
  }

  async logout() {
    this.credentials = null;
    this.currentUser = null;
    // await this.storageService.setCredentials(null);
  }

  loginWithCredentials(credentials: Credentials): Observable<JenkinsUser> {
    return this.getJenkinsCrumb(credentials).pipe(
      tap(async crumbResponse => {
        this.credentials = credentials;
        this.crumbData = crumbResponse.crumb;
        await this.storageService.setCredentials(this.credentials);
      }),
      concatMap(_ => this.getUser())
    );
  }

  loadJobs(): Observable<IJenkinsView[]> {
    return this.storageService.getCredentialsObs().pipe(
      concatMap(credentials => this.http.get<{ views: IJenkinsView[] }>(`${this.baseUrl}/api/json?tree=views[name,url,jobs[name,url,healthReport[iconUrl],color,builds[estimatedDuration,displayName,duration]{0}]]`, this.getAuthHeaders(credentials))),
      map(viewResponse => viewResponse.views),
      map(views => views.sort((v1, _) => v1.name === "Sport" ? -1 : undefined)),
      map(views => views.filter(v => v.name !== "6.2"))
    );
  }

  loadJob(name: string): Observable<IJenkinsJob> {
    return this.storageService.getCredentialsObs().pipe(
      concatMap(credentials => this.http.get<IJenkinsJob>(`${this.baseUrl}/job/${name}/api/json`, this.getAuthHeaders(credentials)))
    );
  }

  getUser(): Observable<JenkinsUser> {
    if (this.currentUser != null) {
      return of(this.currentUser);
    } else {
      return this.storageService.getCredentialsObs().pipe(
        concatMap(credentials => this.http.get<JenkinsUser>(`${this.baseUrl}/user/${this.credentials.username}/api/json`, this.getAuthHeaders(credentials))),
        tap(u => this.currentUser = u)
      );
    }
  }

  buildJob(url: string): Observable<void> {
    return this.storageService.getCredentialsObs().pipe(
      concatMap(credentials => this.getJenkinsCrumb(credentials)),
      concatMap(({crumb, credentials}) => this.http.post<void>(`${url}build`, {}, this.getAuthHeaders(credentials, crumb))),
    );
  }

  private getJenkinsCrumb(credentials: Credentials): Observable<{ crumb: CrumbResponse, credentials: Credentials }> {
    return this.http.get<CrumbResponse>(`${this.baseUrl}/crumbIssuer/api/json`, this.getAuthHeaders(credentials)).pipe(
      map(crumb => {
        return {crumb, credentials};
      })
    );
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
