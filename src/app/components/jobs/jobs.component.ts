import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {JenkinsJob, JenkinsService, JenkinsUser} from "../../services/jenkins.service";
import {Router} from "@angular/router";
import {IJenkinsJob, IJenkinsView} from "jenkins-api-ts-typings";
import * as moment from 'moment';
import {IonSegment} from "@ionic/angular";

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {

  views: IJenkinsView[] = [];
  selectedView: IJenkinsView;
  selectedViewJobs: IJenkinsJob[] = [];
  currentUser: JenkinsUser;
  private refreshTimer: any;
  @ViewChild(IonSegment) segment: IonSegment;

  constructor(private jenkinsService: JenkinsService, private router: Router, private ngZone: NgZone) {
    const momentDurationFormatSetup = require("moment-duration-format");
    this.views = this.jenkinsService.views;
    this.ngZone.run(() => this.segmentButtonClicked(null, this.views[0]));
    if (this.views.length == 0) {
      console.log(`Cannot get list of jobs... logging out`);
      this.premutoLogout();
    } else {
      this.jenkinsService.getUser().subscribe(u => this.currentUser = u);
    }
  }

  ngOnInit() {
    this.refreshTimer = setInterval(() => {
      this.jenkinsService.loadJobs().subscribe(j => this.views = j)
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
    const extension = job.color.includes("anime") ? "gif" : "png";
    return `http://svilmiwcmsapp01.sky.local/jenkins/static/5c0c56aa/images/32x32/${job.color}.${extension}`;
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
        return "assets/sd_logo.jpg"
      }
    } else if (job.name.includes("skysporthd")) {
      if (job.name.includes("delivery")) {
        // AEM logo
        return "assets/aem_logo.jpg"
      } else if (job.name.includes("motori")) {
        // f1 logo
        return "assets/motor_logo.jpg"
      } else {
        // skySport logo
        return "assets/ss_logo.png"
      }
    }
  }

  segmentButtonClicked($event, view: IJenkinsView) {
    this.selectedView = view;
    this.selectedViewJobs = view.jobs.filter(j => !j.name.includes("TEST"))
  }

  doRefresh(event: {target: {complete: Function}}) {
    this.jenkinsService.loadJobs().subscribe(j => {
      this.views = j
      event.target.complete();
    }, (e) => {
      console.log(e);
      event.target.complete();
    })
  }
}
