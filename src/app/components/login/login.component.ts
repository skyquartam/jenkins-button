import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Credentials, JenkinsService} from "../../services/jenkins.service";
import {AlertController, LoadingController, ModalController} from "@ionic/angular";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  credentials: Credentials = {
    username: "",
    password: ""
  };

  constructor(private router: Router, private jenkinsService: JenkinsService, private alertController: AlertController, private loadingController: LoadingController) {
  }

  ngOnInit() {
  }

  async premutoLogin() {
    const loader = await this.loadingController.create({
      message: "Login in corso..."
    });
    await loader.present();
    this.jenkinsService.loadJobsWithCredentials(this.credentials).subscribe(
      async () => {
        await loader.dismiss();
        this.router.navigate(["jobs"]);
      },
      async (e: HttpErrorResponse) => {
        await loader.dismiss();
        if (e.status == 401) {
          this.presentError(`Username o password errate!`);
        } else {
          this.presentError(`Errore sconosciuto durante il login, controlla di essere dentro la VPN Sky`);
        }
      }
    );
  }

  async presentError(message: string =`C'è stato un errore durante il login`) {
    const alert = await this.alertController.create({
      header: 'Attenzione',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
