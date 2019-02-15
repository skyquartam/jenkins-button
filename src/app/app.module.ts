import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";

import {HttpClientModule} from "@angular/common/http";

import {AppRoutingModule} from "./modules/app-routing.module";

import {ElectronService} from "./services/electron.service";

import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LoginComponent} from "./components/login/login.component";
import {JobsComponent} from "./components/jobs/jobs.component";
import {ReleaserComponent} from "./components/releaser/releaser.component";
import {IonicModule} from "@ionic/angular";
import {JenkinsService} from "./services/jenkins.service";
import {FormsModule} from "@angular/forms";
import {IonicStorageModule} from "@ionic/storage";
import {StorageService} from "./services/storage.service";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {NgxElectronModule} from "ngx-electron";
import {UpdaterComponent} from "./components/updater/updater.component";

@NgModule({
  declarations: [AppComponent, LoginComponent, JobsComponent, ReleaserComponent, UpdaterComponent],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    ScrollingModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    FormsModule,
    NgxElectronModule
  ],
  providers: [ElectronService, JenkinsService, StorageService],
  bootstrap: [AppComponent],
  entryComponents: [
    UpdaterComponent
  ]
})
export class AppModule {
}
