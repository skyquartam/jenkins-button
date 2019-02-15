import {Component, OnInit, HostListener, OnDestroy, ViewChild, ElementRef, NgZone} from "@angular/core";
import {JenkinsJob, JenkinsService} from "../../services/jenkins.service";
import {ActivatedRoute, Router} from "@angular/router";
import {concatMap, filter, map, tap} from "rxjs/operators";
import {IJenkinsJob} from "jenkins-api-ts-typings";
import {AlertController, IonList, IonSegment, LoadingController, NavController} from "@ionic/angular";
import {SonarQubeService} from "../../services/sonar-qube.service";
import * as moment from "moment";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";


@Component({
  selector: "app-releaser",
  templateUrl: "./releaser.component.html",
  styleUrls: ["./releaser.component.scss"]
})
export class ReleaserComponent implements OnInit, OnDestroy {
  selectedJob: IJenkinsJob;
  private audio: HTMLAudioElement;
  releasingStatus: "quiet" | "releasing" | "released" = "quiet";
  sonarStatus: "unknown" | "present" | "notPresent";
  consoleLines: string[] = [];
  private consoleTimer: any;
  @ViewChild(CdkVirtualScrollViewport)
  public virtualScrollViewport?: CdkVirtualScrollViewport;
  private sonarComponent: string;
  private coverage: SonarQube.Coverage.History;
  private techDebt: SonarQube.Issues.APIResponse;
  private lastBuildCommit: Jenkins.LastBuildQuery.Item;

  constructor(private sonarService: SonarQubeService, private activatedRoute: ActivatedRoute, private jenkinsService: JenkinsService, private router: Router, private alertController: AlertController, private loadingController: LoadingController, private ngZone: NgZone) {
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
      this.checkForSonar();
    });
  }

  ngOnInit() {
    this.releasingStatus = "quiet";
    this.loadJob();
  }

  ngOnDestroy(): void {
    clearInterval(this.consoleTimer);
  }

  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === "Enter") {
      this.premutoRelease();
    }
  }

  checkForSonar() {
    this.sonarStatus = "unknown";
    this.jenkinsService.getSonarQubeComponent(this.selectedJob.url).pipe(
      tap(r => this.lastBuildCommit = r.changeSet && r.changeSet.items[0]),
      map(r => r.actions.filter(a => typeof a["_class"] !== "undefined" && a["_class"] === "hudson.plugins.sonar.action.SonarAnalysisAction")),
      map(a => a.length > 0 ? a[0].sonarqubeDashboardUrl : null),
      map(sonarUrl => sonarUrl != null ? sonarUrl.split(`${this.sonarService.baseUrl}/dashboard/index/`)[1] : null)
    ).subscribe(sonarComponent => {
      if (sonarComponent != null) {
        this.sonarStatus = "present";
        this.sonarComponent = sonarComponent;
        this.loadSonarMetrics();
      } else {
        this.sonarStatus = "notPresent";
      }
    });
  }

  loadSonarMetrics() {
    this.sonarService.getCoverage(this.sonarComponent).subscribe(cov => this.coverage = cov);
    this.sonarService.getTechDebt(this.sonarComponent).subscribe(techDebt => this.techDebt = techDebt);
  }

  getFormattedTechDebt() {
    return (moment.duration(this.techDebt.debtTotal, "minutes") as any).format("d __, h __, m __");
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
            this.virtualScrollViewport.scrollTo({bottom: 0});
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
