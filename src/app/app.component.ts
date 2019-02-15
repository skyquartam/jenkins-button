import {Component, OnInit} from "@angular/core";
import * as moment from "moment";
import "moment/min/locales";
import ipcRenderer = Electron.ipcRenderer;
import {ProgressInfo} from "./models/electron-models";
import {IpcService} from "./services/ipc.service";
import {ModalController} from "@ionic/angular";
import {UpdaterComponent} from "./components/updater/updater.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  constructor(private readonly ipc: IpcService, private readonly modalCtrl: ModalController) {
    const momentDurationFormatSetup = require("moment-duration-format"); // needed to load the library
    moment.locale("it-IT");
    moment.updateLocale("it", {
      durationLabelsStandard: {
        S: "millisecond",
        SS: "milliseconds",
        s: "secondo",
        ss: "secondi",
        m: "minuto",
        mm: "minuti",
        h: "ora",
        hh: "ore",
        d: "giorno",
        dd: "giorni",
        w: "settimana",
        ww: "settimane",
        M: "mese",
        MM: "mesi",
        y: "anno",
        yy: "anni"
      },
      durationLabelsShort: {
        S: "msec",
        SS: "msecs",
        s: "s",
        ss: "s",
        m: "min",
        mm: "min",
        h: "ora",
        hh: "ore",
        d: "g",
        dd: "g",
        w: "sett",
        ww: "sett",
        M: "m",
        MM: "m",
        y: "a",
        yy: "a"
      },
      durationTimeTemplates: {
        HMS: "h:mm:ss",
        HM: "h:mm",
        MS: "m:ss"
      },
      durationLabelTypes: [
        {type: "standard", string: "__"},
        {type: "short", string: "_"}
      ],
      durationPluralKey: function (token, integerValue, decimalValue) {
        // Singular for a value of `1`, but not for `1.0`.
        if (integerValue === 1 && decimalValue === null) {
          return token;
        }

        return token + token;
      }
    });
  }

  ngOnInit() {
    this.ipc.on("update-available", this.showUpdaterModal.bind(this));
  }

  private async showUpdaterModal() {
    const modal = await this.modalCtrl.create({
      component: UpdaterComponent,
      backdropDismiss: false
    });
    await modal.present();
  }
}
