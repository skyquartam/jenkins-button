import {Injectable} from "@angular/core";
import {ElectronService} from "ngx-electron";

@Injectable({
  providedIn: "root"
})
export class IpcService {


  constructor(private readonly electron: ElectronService) {
  }

  public on(channel: string, listener: Function): void {
    if (this.electron.isElectronApp) {
      this.electron.ipcRenderer.on(channel, listener);
    } else {
      console.warn(`Electron is not available!`);
    }
  }

  public send(channel: string, ...args): void {
    if (this.electron.isElectronApp) {
      this.electron.ipcRenderer.send(channel, args);
    } else {
      console.warn(`Electron is not available!`);
    }
  }
}
