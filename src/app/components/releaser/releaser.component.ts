import { Component, OnInit } from '@angular/core';
import {JenkinsJob, JenkinsService} from "../../services/jenkins.service";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-releaser',
  templateUrl: './releaser.component.html',
  styleUrls: ['./releaser.component.scss']
})
export class ReleaserComponent implements OnInit {
  selectedJob: JenkinsJob;

  constructor(private activatedRoute: ActivatedRoute, private jenkinsService: JenkinsService, private router: Router) {
    this.activatedRoute.paramMap.pipe(
      map(params => params.get("jobName")),
      map(jobName => this.jenkinsService.jobs.filter(j => j.name == jobName)[0])
    ).subscribe(job => this.selectedJob = job)
  }

  ngOnInit() {
  }

  premutoBack() {
    this.router.navigate(["jobs"]);
  }
}
