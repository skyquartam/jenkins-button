declare module Jenkins {

  module SonarQubeQuery {
    export interface Action {
      _class: string;
      sonarqubeDashboardUrl: string;
    }

    export interface APIResponse {
      _class: string;
      actions: Action[];
    }
  }

}

