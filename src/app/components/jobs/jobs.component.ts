import {Component, OnDestroy, OnInit} from '@angular/core';
import {JenkinsJob, JenkinsService, JenkinsUser} from "../../services/jenkins.service";
import {Router} from "@angular/router";
import {IJenkinsJob} from "jenkins-api-ts-typings";
import * as moment from 'moment';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {

  jobs: IJenkinsJob[] = [];
  currentUser: JenkinsUser;
  private refreshTimer: any;

  constructor(private jenkinsService: JenkinsService, private router: Router) {
    const momentDurationFormatSetup = require("moment-duration-format");
    this.jobs = this.jenkinsService.jobs;
    if (this.jobs.length == 0) {
      console.log(`Cannot get list of jobs... logging out`)
      this.premutoLogout();
    } else {
      this.jenkinsService.getUser().subscribe(u => this.currentUser = u);
    }
  }

  ngOnInit() {
    this.refreshTimer = setInterval(() => {
      this.jenkinsService.loadJobs().subscribe(j => this.jobs = j)
    }, 20 * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  premutoJob(job: IJenkinsJob) {
    this.router.navigate(["jobs", job.name])
  }

  premutoLogout() {
    this.jenkinsService.logout();
    this.router.navigate([""])
  }

  iconForJob(job: IJenkinsJob) {
    switch (job.color) {
      case "blue":
        return "http://svilmiwcmsapp01.sky.local/jenkins/static/5c0c56aa/images/32x32/blue.png";
      case "disabled":
        return "http://svilmiwcmsapp01.sky.local/jenkins/static/5c0c56aa/images/32x32/disabled.png";
      case "red":
        return "http://svilmiwcmsapp01.sky.local/jenkins/static/5c0c56aa/images/32x32/red.png";
      case "blue_anime":
        return "http://svilmiwcmsapp01.sky.local/jenkins/static/5c0c56aa/images/32x32/blue_anime.gif"
    }
  }

  wheatherForJob(job: IJenkinsJob) {
    return `http://svilmiwcmsapp01.sky.local/jenkins/static/5c0c56aa/images/32x32/${job.healthReport[0].iconUrl}`
  }

  formatDuration(duration: number) {
    return (moment.duration(duration, "milliseconds") as any).format("m [min] s[s]")
  }

  logoForJob(job: IJenkinsJob) {
    if (job.name.includes("sportsdata")) {
      if (job.name.includes("AWS")) {
        // AWS logo
        return "assets/aws_logo.jpg"
      } else {
        // build logo
        return "assets/build_logo.jpg"
      }
    } else if (job.name.includes("skysporthd")) {
      if (job.name.includes("delivery")) {
        // AEM logo
        return "assets/aem_logo.jpg"
      } else if (job.name.includes("motori")) {
        // f1 logo
        return "assets/motor_logo.jpg"
      } else {
        // build logo
        return "assets/build_logo.jpg"
      }
    }
  }
}
