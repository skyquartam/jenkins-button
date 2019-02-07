import {Component, OnInit, HostListener, OnDestroy, ViewChild, ElementRef, NgZone} from "@angular/core";
import {JenkinsJob, JenkinsService} from "../../services/jenkins.service";
import {ActivatedRoute, Router} from "@angular/router";
import {concatMap, filter, map} from "rxjs/operators";
import {IJenkinsJob} from "jenkins-api-ts-typings";
import {AlertController, IonList, IonSegment, LoadingController} from "@ionic/angular";
import {el} from "@angular/platform-browser/testing/src/browser_util";

@Component({
  selector: "app-releaser",
  templateUrl: "./releaser.component.html",
  styleUrls: ["./releaser.component.scss"]
})
export class ReleaserComponent implements OnInit, OnDestroy {
  selectedJob: IJenkinsJob;
  private audio: HTMLAudioElement;
  releasingStatus: "quiet" | "releasing" | "released" = "quiet";
  consoleLines: string[] = [];
  private consoleTimer: any;
  @ViewChild("scrollMe", {read: ElementRef}) linesList: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private jenkinsService: JenkinsService, private router: Router, private alertController: AlertController, private loadingController: LoadingController, private ngZone: NgZone) {
    this.loadJob();
    this.loadAudio();
  }

  async loadJob() {
    const loading = await this.loadingController.create({
      message: "Caricamento Job..."
    });
    await loading.present();
    this.activatedRoute.paramMap.pipe(
      map(params => params.get("jobName")),
      concatMap(jobName => this.jenkinsService.loadJob(jobName))
    ).subscribe(async job => {
      this.selectedJob = job;
      await loading.dismiss();
    });
  }

  ngOnInit() {
    this.releasingStatus = "quiet";
  }

  ngOnDestroy(): void {
    clearInterval(this.consoleTimer);
  }

  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === "13") { // Enter key
      this.premutoRelease();
    }
  }

  loadAudio() {
    this.audio = new Audio();
    this.audio.src = "./assets/leeroy.mp3";
    this.audio.load();
  }

  premutoBack() {
    this.router.navigate(["jobs"]);
  }

  premutoRelease() {
    if (!this.selectedJob) {
      console.log(`Job not yet downloaded!`);
      return;
    }
    if (this.releasingStatus !== "quiet") {
      console.log(`Job already starting/started`);
      return;
    }
    this.releasingStatus = "releasing";
    this.audio.play();
    this.jenkinsService.buildJob(this.selectedJob.url).subscribe(() => {
      this.releasingStatus = "released";
      this.checkForConsoleLines();
    }, (e) => {
      console.log(e);
      this.mostraErrore(e.message);
    });
  }

  checkForConsoleLines() {
    this.consoleTimer = setInterval(() => {
      this.jenkinsService.getConsoleLines(this.selectedJob.url).subscribe(lines => {
        this.consoleLines = lines;
        setTimeout(() => {
          this.ngZone.run(() => {
            this.linesList.nativeElement.scrollTop = this.linesList.nativeElement.scrollHeight;
          });
        }, 100);
      });
    }, 2 * 1000);
  }

  async mostraErrore(error: string) {
    const alert = await this.alertController.create({
      header: "Errore",
      message: error,
      buttons: ["Ok"]
    });
    await alert.present();
  }

  // iconForJob() {
  //   const extension = this.selectedJob.color.includes("anime") ? "gif" : "png";
  //   return `${this.jenkinsService.imagePath}${this.selectedJob.color}.${extension}`;
  // }
  //
  // logoForJob() {
  //   if (this.selectedJob.name.includes("sportsdata")) {
  //     if (this.selectedJob.name.includes("AWS")) {
  //       // AWS logo
  //       return "assets/aws_logo.jpg";
  //     } else {
  //       // build logo
  //       return "assets/sd_logo.jpg";
  //     }
  //   } else if (this.selectedJob.name.includes("skysporthd")) {
  //     if (this.selectedJob.name.includes("delivery")) {
  //       // AEM logo
  //       return "assets/aem_logo.jpg";
  //     } else if (this.selectedJob.name.includes("motori")) {
  //       // f1 logo
  //       return "assets/motor_logo.jpg";
  //     } else {
  //       // skySport logo
  //       return "assets/ss_logo.png";
  //     }
  //   }
  // }
}
