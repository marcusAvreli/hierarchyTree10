import { TestBed } from '@angular/core/testing';

import { OrgNodeService } from './org-node.service';

describe('OrgNodeService', () => {
  let service: OrgNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgNodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
