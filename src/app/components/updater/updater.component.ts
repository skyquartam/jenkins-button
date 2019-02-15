import {Component, NgZone, OnInit} from "@angular/core";
import {IpcService} from "../../services/ipc.service";
import {ProgressInfo} from "../../models/electron-models";
import {ModalController} from "@ionic/angular";

@Component({
  selector: "app-updater",
  templateUrl: "./updater.component.html",
  styleUrls: ["./updater.component.scss"]
})
export class UpdaterComponent implements OnInit {

  // {bytesPerSecond: 697985, delta: 1344512, percent: 4.783640860129985, total: 74677178, transferred: 3572288}
  progressInfo: ProgressInfo = {bytesPerSecond: 0, delta: 0, percent: 0, total: 0, transferred: 0};
  private message: string;

  constructor(private readonly ipc: IpcService, private readonly ngZone: NgZone, private readonly modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.ipc.on("update-progress", this.updateProgress.bind(this));
    this.ipc.on("update-error", this.showError.bind(this));
    this.message = this.generateLog(this.progressInfo);
  }

  showError(sender: any, error: any) {
    console.log(`Received error from update!`);
    console.log(error.toString());
  }

  updateProgress(sender: any, progressInfo: ProgressInfo) {
    this.ngZone.run(() => {
      this.progressInfo = progressInfo;
      this.message = this.generateLog(progressInfo);
    });
  }

  generateLog(progressInfo: ProgressInfo): string {
    let log_message = "Download speed: " + this.formatBytes(progressInfo.bytesPerSecond);
    log_message = log_message + " - Downloaded " + progressInfo.percent.toFixed(2) + "%";
    log_message = log_message + " (" + this.formatBytes(progressInfo.transferred) + "/" + this.formatBytes(progressInfo.total) + ")";
    return log_message;
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

}
