import {Injectable} from "@angular/core";
import {Credentials} from "./jenkins.service";
import {Storage} from "@ionic/storage";
import {fromPromise} from "rxjs/internal-compatibility";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class StorageService {

  constructor(private storage: Storage) {
  }

  public setCredentials(credentials: Credentials) {
    if (credentials) {
      const securedCredentials = {username: credentials.username, password: btoa(credentials.password)};
      return this.storage.set("credentials", securedCredentials);
    } else {
      return this.storage.remove("credentials");
    }
  }

  public getCredentials() {
    return this.storage.get("credentials").then((c: Credentials | null) => {
      if (c != null) {
        c.password = atob(c.password);
      }
      return c;
    });
  }

  public getCredentialsObs(): Observable<Credentials> {
    return fromPromise(this.getCredentials());
  }
}
