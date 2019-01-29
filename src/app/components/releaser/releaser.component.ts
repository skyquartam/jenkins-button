import {Component, OnInit} from '@angular/core';
import {JenkinsJob, JenkinsService} from "../../services/jenkins.service";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";
import {IJenkinsJob} from "jenkins-api-ts-typings";

@Component({
  selector: 'app-releaser',
  templateUrl: './releaser.component.html',
  styleUrls: ['./releaser.component.scss']
})
export class ReleaserComponent implements OnInit {
  selectedJob: IJenkinsJob;
  private audio: HTMLAudioElement;
  releasingStatus: "quiet" | "releasing" | "released" = "quiet";

  constructor(private activatedRoute: ActivatedRoute, private jenkinsService: JenkinsService, private router: Router) {
    this.activatedRoute.paramMap.pipe(
      map(params => params.get("jobName")),
      map(jobName => [].concat(...this.jenkinsService.views.map(v => v.jobs)).filter(j => j.name == jobName)[0])
    ).subscribe(job => this.selectedJob = job);
    this.loadAudio()
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
    if (this.releasingStatus != "quiet") {
      console.log(`Job already starting/started`);
      return
    }
    this.releasingStatus = "releasing";
    this.audio.play();
    this.jenkinsService.buildJob(this.selectedJob.url).subscribe(() => {
      this.releasingStatus = "released"
    }, (e) => {
      console.log(e);
    });
  }
}
