import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";

import {LoginComponent} from "../components/login/login.component";
import {JobsComponent} from "../components/jobs/jobs.component";
import {ReleaserComponent} from "../components/releaser/releaser.component";

const routes: Routes = [
  {
    path: "",
    component: LoginComponent
  },
  {
    path: "jobs",
    component: JobsComponent
  },
  {
    path:"jobs/:jobName",
    component: ReleaserComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
