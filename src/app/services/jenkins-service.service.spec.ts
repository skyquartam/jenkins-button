import { TestBed } from '@angular/core/testing';

import { JenkinsServiceService } from './jenkins-service.service';

describe('JenkinsServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JenkinsServiceService = TestBed.get(JenkinsServiceService);
    expect(service).toBeTruthy();
  });
});
