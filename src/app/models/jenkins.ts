declare module Jenkins {

  module LastBuildQuery {

    export interface Item {
      _class: string;
      affectedPaths: string[];
      commitId: string;
      timestamp: number;
      author: string;
      authorEmail: string;
      comment: string;
      date: string;
      id: string;
      msg: string;
      paths: string[];
    }

    export interface ChangeSet {
      _class: string;
      items: Item[];
    }


    export interface Action {
      _class: string;
      sonarqubeDashboardUrl: string;
    }

    export interface APIResponse {
      _class: string;
      actions: Action[];
      changeSet: ChangeSet;
    }
  }

}

