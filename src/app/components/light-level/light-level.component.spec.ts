import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightLevelComponent } from './light-level.component';

describe('LightLevelComponent', () => {
  let component: LightLevelComponent;
  let fixture: ComponentFixture<LightLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LightLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
