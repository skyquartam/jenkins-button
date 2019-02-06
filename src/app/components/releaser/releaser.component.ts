import {Component, OnInit} from "@angular/core";
import {JenkinsJob, JenkinsService} from "../../services/jenkins.service";
import {ActivatedRoute, Router} from "@angular/router";
import {concatMap, filter, map} from "rxjs/operators";
import {IJenkinsJob} from "jenkins-api-ts-typings";
import {AlertController} from "@ionic/angular";

@Component({
  selector: "app-releaser",
  templateUrl: "./releaser.component.html",
  styleUrls: ["./releaser.component.scss"]
})
export class ReleaserComponent implements OnInit {
  selectedJob: IJenkinsJob;
  private audio: HTMLAudioElement;
  releasingStatus: "quiet" | "releasing" | "released" = "quiet";

  constructor(private activatedRoute: ActivatedRoute, private jenkinsService: JenkinsService, private router: Router, private alertController: AlertController) {
    this.activatedRoute.paramMap.pipe(
      map(params => params.get("jobName")),
      concatMap(jobName => this.jenkinsService.loadJob(jobName))
    ).subscribe(job => this.selectedJob = job);
    this.loadAudio();
  }

  ngOnInit() {
    this.releasingStatus = "quiet";
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
    if (this.releasingStatus !== "quiet") {
      console.log(`Job already starting/started`);
      return;
    }
    this.releasingStatus = "releasing";
    this.audio.play();
    this.jenkinsService.buildJob(this.selectedJob.url).subscribe(() => {
      this.releasingStatus = "released";
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
}
