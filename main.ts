import {app, ipcMain, ipcRenderer, BrowserWindow, screen, dialog, Menu} from "electron";
import * as path from "path";
import * as url from "url";
import {execFile} from "child_process";
import {autoUpdater} from "electron-updater";
import {join} from "path";
import openAboutWindow from "about-window";
import * as isDev from "electron-is-dev";
import * as ProgressBar from "electron-progressbar/source";

class ElectronMain {
  appTitle = "Jenkins Button";
  args: any;
  mainWindow: BrowserWindow;
  secondWindow: BrowserWindow;
  progressBar: ProgressBar;

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
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.setFeedURL({
      provider: "github",
      repo: "jenkins-button",
      owner: "skyquartam",
      private: false
    });
    autoUpdater.checkForUpdates();
    autoUpdater.addListener("error", function (error) {
      dialog.showMessageBox({title: "Error Happened", message: error, buttons: ["OK"]});
    });
    autoUpdater.addListener("checking-for-update", function (event) {
      dialog.showMessageBox({title: "Checking for update", message: `Checking for updates...`, buttons: ["OK"]});
    });
    autoUpdater.on("error", (error) => {
      dialog.showErrorBox("Error: ", error == null ? "unknown" : (error.stack || error).toString());
    });
    autoUpdater.signals.updateDownloaded(updateInfo => {
      const buttonIndex = dialog.showMessageBox(
        {
          title: "Update downloaded",
          message: `Version ${updateInfo.version} is downloaded and will be automatically installed on Quit`,
          buttons: [
            "Installa ora e riavvia",
            "Installa al prossimo riavvio"
          ]
        });
      if (buttonIndex === 0) {
        autoUpdater.quitAndInstall();
      }
    });
    this.initProgressEvent();
  }

  initProgressEvent() {
    autoUpdater.addListener("update-available", function (event) {
      dialog.showMessageBox({title: "A new update is ready to install", message: `A new shiny version (${event.version}) is available, click "Ok" to download `, buttons: ["OK"]});
    });
    autoUpdater.signals.progress(progressInfo => {
      let log_message = "Download speed: " + this.formatBytes(progressInfo.bytesPerSecond);
      log_message = log_message + " - Downloaded " + progressInfo.percent.toFixed(2) + "%";
      log_message = log_message + " (" + this.formatBytes(progressInfo.transferred) + "/" + this.formatBytes(progressInfo.total) + ")";
      console.log(log_message);
      if (!this.progressBar) {
        this.progressBar = new ProgressBar({
          text: "Downloading update...",
          detail: "Please wait...",
          indeterminate: false,
          browserWindow: {
            parent: this.mainWindow
          }
        });
        this.progressBar.on("completed", () => {
          this.progressBar.detail = "Task completed. Exiting...";
          this.progressBar = null;
        });
      }
      this.progressBar.detail = log_message;
      this.progressBar.value = progressInfo.percent;
    });
  }

  formatBytes(bytes: number, decimals?: number) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024,
      dm = decimals <= 0 ? 0 : decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
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
    if (!isDev) {
      this.createMenu();
    }
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
      titleBarStyle,
      // backgroundColor: "#d38312"
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

  private createMenu() {
    const menu = Menu.buildFromTemplate([
      {
        label: "Example",
        submenu: [
          {
            label: `About ${this.appTitle}`,
            click: () =>
              openAboutWindow({
                icon_path: join(__dirname, "buildResources", "icon.png"),
                package_json_dir: __dirname
              }),
          },
        ],
      },
    ]);
    Menu.setApplicationMenu(menu);
  }
}

export default new ElectronMain();
