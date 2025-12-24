import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAppContainerComponent } from './app-app-container.component';

describe('AppAppContainerComponent', () => {
  let component: AppAppContainerComponent;
  let fixture: ComponentFixture<AppAppContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppAppContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppAppContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
