import {Component, OnInit} from '@angular/core';
import {JenkinsJob, JenkinsService} from "../../services/jenkins.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  jobs: JenkinsJob[] = [];

  constructor(private jenkinsService: JenkinsService, private router: Router) {
    this.jenkinsService.getPipelines().subscribe(jobs => {
      this.jobs = jobs;
    });
  }

  ngOnInit() {
  }

  premutoJob(job: JenkinsJob) {
    this.router.navigate(["jobs", job.name])
  }
}
