import { Component, OnInit } from "@angular/core";
import { JenkinsServiceService, JenkinsJob } from "src/app/services/jenkins-service.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  title = "Electron Angular App";
  audio: HTMLAudioElement;
  jobs: JenkinsJob[] = [];
  selectedJob: JenkinsJob;
  jobStarted = false;
  jobStarting = false;

  constructor(private jenkinsService: JenkinsServiceService) {
    this.audio = new Audio();
    this.audio.src = "./assets/leeroy.mp3";
    this.audio.load();
  }

  ngOnInit() {
    this.jenkinsService.getPipelines().subscribe(jobs => {
      this.jobs = jobs;
    });
  }

  premutoRelease() {
    this.jobStarting = true;
    this.audio.play();
    this.jenkinsService.build(this.selectedJob.url).subscribe(() => {
      this.jobStarting = false;
      this.jobStarted = true;
    }, (err) => {
      console.log(err);
    });
  }

  selected(job: JenkinsJob) {
    this.selectedJob = job;
  }

  changePipeline() {
    this.selectedJob = null;
    this.jobStarted = false;
    this.jobStarting = false;
  }
}
