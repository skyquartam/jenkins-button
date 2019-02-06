import { Component, OnInit, HostListener } from "@angular/core";
import { JenkinsJob, JenkinsService } from "../../services/jenkins.service";
import { ActivatedRoute, Router } from "@angular/router";
import { concatMap, filter, map } from "rxjs/operators";
import { IJenkinsJob } from "jenkins-api-ts-typings";
import { AlertController, LoadingController } from "@ionic/angular";

@Component({
  selector: "app-releaser",
  templateUrl: "./releaser.component.html",
  styleUrls: ["./releaser.component.scss"]
})
export class ReleaserComponent implements OnInit {
  selectedJob: IJenkinsJob;
  private audio: HTMLAudioElement;
  releasingStatus: "quiet" | "releasing" | "released" = "quiet";

  constructor(private activatedRoute: ActivatedRoute, private jenkinsService: JenkinsService, private router: Router, private alertController: AlertController, private loadingController: LoadingController) {
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

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.charCode == 13) { // Enter key
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
    setTimeout(() => {
      this.premutoBack();
    }, 1000)
  }, (e) => {
    console.log(e);
    this.mostraErrore(e.message);
  });
}

async mostraErrore(error: string) {
  const alert = await this.alertController.create({
    header: "Errore",
    message: error,
    buttons: ["Ok"]
  });
  await alert.present();
}

iconForJob() {
  const extension = this.selectedJob.color.includes("anime") ? "gif" : "png";
  return `${this.jenkinsService.imagePath}${this.selectedJob.color}.${extension}`;
}

logoForJob() {
  if (this.selectedJob.name.includes("sportsdata")) {
    if (this.selectedJob.name.includes("AWS")) {
      // AWS logo
      return "assets/aws_logo.jpg";
    } else {
      // build logo
      return "assets/sd_logo.jpg";
    }
  } else if (this.selectedJob.name.includes("skysporthd")) {
    if (this.selectedJob.name.includes("delivery")) {
      // AEM logo
      return "assets/aem_logo.jpg";
    } else if (this.selectedJob.name.includes("motori")) {
      // f1 logo
      return "assets/motor_logo.jpg";
    } else {
      // skySport logo
      return "assets/ss_logo.png";
    }
  }
}
}
