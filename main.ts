import {app, ipcMain, ipcRenderer, BrowserWindow, screen, dialog} from "electron";
import * as path from "path";
import * as url from "url";
import {execFile} from "child_process";
import {autoUpdater} from "electron-updater";


class ElectronMain {
  appTitle = "Jenkins Button";
  args: any;
  mainWindow: BrowserWindow;
  secondWindow: BrowserWindow;

  constructor() {
    this.initApp();
    this.initAppEvents();
    this.initIpc();
    this.initAutoUpdaterEvents();
  }

  initApp() {
    this.enableHotReload(this.checkElectronArgs());
    this.disableSecurityWarnings();
  }

  initAppEvents() {
    app.on("ready", () => this.createMainWindow());
    app.on("window-all-closed", () => this.quitAppOnNonDarwin());
    app.on("activate", () => this.createDefaultWindows());
  }

  initAutoUpdaterEvents() {
    autoUpdater.checkForUpdates();
    autoUpdater.addListener("update-available", function (event) {
      console.log(JSON.stringify(event));
      dialog.showMessageBox({title: "A new update is ready to install", message: `Version is downloaded and will be automatically installed on Quit`, buttons: ["OK"]});
    });
    autoUpdater.addListener("update-downloaded", function (event, releaseNotes, releaseName, releaseDate, updateURL) {
      autoUpdater.quitAndInstall();
    });
    autoUpdater.addListener("error", function (error) {
      dialog.showMessageBox({title: "Error Happened", message: error, buttons: ["OK"]});
    });
    autoUpdater.addListener("checking-for-update", function (event) {
      dialog.showMessageBox({title: "Checking for update", message: `Checking for updates...`, buttons: ["OK"]});
    });
    autoUpdater.addListener("update-not-available", function (event) {
      dialog.showMessageBox({title: "No update available", message: `No updates available!`, buttons: ["OK"]});
    });
    autoUpdater.on("error", (error) => {
      dialog.showErrorBox("Error: ", error == null ? "unknown" : (error.stack || error).toString());
    });
  }

  initIpc() {
    ipcMain.on("event", (e, data) => this.ipcEventHandler(e, data));
  }

  checkElectronArgs(): boolean {
    this.args = process.argv.slice(1);
    return this.args.some(val => val === "--serve");
  }

  enableHotReload(serve: boolean) {
    if (serve) {
      require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
      });
    }
  }

  createMainWindow() {
    this.mainWindow = this.createBrowserWindow();
    this.loadFromFile(this.mainWindow);
    this.onWindowClosed(this.mainWindow);
  }


  createBrowserWindow(): BrowserWindow {
    const isMac = process.platform === "darwin";
    const titleBarStyle = isMac ? "hiddenInset" : "default";
    return new BrowserWindow({
      title: this.appTitle,
      width: 570,
      height: 850,
      autoHideMenuBar: true,
      center: true,
      titleBarStyle
    });
  }

  loadFromFile(window: BrowserWindow, routePath: string = "/") {
    window.loadURL(
      url.format({
        pathname: path.join(__dirname, "/dist/electron-angular/index.html"),
        protocol: "file:",
        slashes: true,
        hash: routePath,
      })
    );
  }

  enableDevTools(window: BrowserWindow) {
    window.webContents.openDevTools();
  }

  onWindowClosed(window: BrowserWindow) {
    window.on("closed", () => {
      this.mainWindow = null;
      this.secondWindow = null;
      app.quit();
      app.exit();
    });
  }

  createDefaultWindows() {
    if (null === this.mainWindow) {
      this.createMainWindow();
    }

    if (this.secondWindow === null) {
      // this.createSecondWindow();
    }
  }

  quitAppOnNonDarwin() {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  ipcEventHandler(e: any, data: any) {
    console.log("[EVENT]:", "recieved from main process");
  }

  disableSecurityWarnings() {
    process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
  }

  execFile(pathUrl?: string) {
    if (pathUrl) {
      return new Promise((resolve, reject) => {
        execFile(pathUrl, (err, data) => {
          if (err) {
            reject(err);
          }

          if (data) {
            resolve(data);
          }
        });
      });
    }
    return Promise.reject("No path provided!");
  }
}

export default new ElectronMain();
