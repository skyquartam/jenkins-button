import { Injectable } from '@angular/core';
import {Credentials} from "./jenkins.service";
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {}

  public setCredentials(credentials:Credentials) {
    credentials.password = btoa(credentials.password);
    return this.storage.set("credentials", credentials)
  }

  public getCredentials() {
    return this.storage.get("credentials").then((c: Credentials | null) => {
      if (c != null) {
        c.password = atob(c.password);
      }
      return c;
    })
  }
}
