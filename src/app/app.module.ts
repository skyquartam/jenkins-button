import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./modules/app-routing.module";

import { ElectronService } from "./services/electron.service";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LoginComponent } from './components/login/login.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { ReleaserComponent } from './components/releaser/releaser.component';
import { IonicModule } from '@ionic/angular';
import {JenkinsService} from "./services/jenkins.service";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [AppComponent, HomeComponent, LoginComponent, JobsComponent, ReleaserComponent],
  imports: [AppRoutingModule, HttpClientModule, BrowserModule, BrowserAnimationsModule, IonicModule.forRoot(), FormsModule],
  providers: [ElectronService, JenkinsService],
  bootstrap: [AppComponent]
})
export class AppModule {}
