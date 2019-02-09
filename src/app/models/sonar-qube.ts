declare module SonarQube {
  module Coverage {

    export interface Paging {
      pageIndex: number;
      pageSize: number;
      total: number;
    }

    export interface History {
      date: Date;
      value: string;
    }

    export interface Measure {
      metric: string;
      history: History[];
    }

    export interface APIResponse {
      paging: Paging;
      measures: Measure[];
    }
  }

  module Issues {

    export interface Paging {
      pageIndex: number;
      pageSize: number;
      total: number;
    }

    export interface TextRange {
      startLine: number;
      endLine: number;
      startOffset: number;
      endOffset: number;
    }

    export interface Location {
      textRange: TextRange;
      msg: string;
    }

    export interface Flow {
      locations: Location[];
    }

    export interface Issue {
      key: string;
      rule: string;
      severity: string;
      component: string;
      project: string;
      line: number;
      hash: string;
      textRange: TextRange;
      flows: Flow[];
      status: string;
      message: string;
      effort: string;
      debt: string;
      assignee: string;
      author: string;
      tags: string[];
      creationDate: Date;
      updateDate: Date;
      type: string;
      organization: string;
    }

    export interface Component {
      organization: string;
      key: string;
      uuid: string;
      enabled: boolean;
      qualifier: string;
      name: string;
      longName: string;
      path: string;
    }

    export interface Value {
      val: string;
      count: number;
    }

    export interface Facet {
      property: string;
      values: Value[];
    }

    export interface APIResponse {
      total: number;
      p: number;
      ps: number;
      paging: Paging;
      effortTotal: number;
      debtTotal: number;
      issues: Issue[];
      components: Component[];
      facets: Facet[];
    }

  }
}
