import { Component, OnInit } from "@angular/core";
import { JenkinsService, JenkinsJob } from "src/app/services/jenkins.service";
import { ElectronService } from 'src/app/services/electron.service';

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

  constructor(private jenkinsService: JenkinsService, private electronService: ElectronService) {
    this.audio = new Audio();
    this.audio.src = "./assets/leeroy.mp3";
    this.audio.load();

  }

  ngOnInit() {
    // this.jenkinsService.getPipelines().subscribe(jobs => {
    //   this.jobs = jobs;
    // });
  }

  premutoRelease() {
    this.jobStarting = true;
    this.audio.play();
    // this.jenkinsService.build(this.selectedJob.url).subscribe(() => {
    //   this.jobStarting = false;
    //   this.jobStarted = true;
    // }, (err) => {
    //   console.log(err);
    // });
  }

  selected(job: JenkinsJob) {
    this.selectedJob = job;
    this.jobStarted = false;
    this.jobStarting = false;
  }

  changePipeline() {
    this.selectedJob = null;
    this.jobStarted = false;
    this.jobStarting = false;
  }
}
