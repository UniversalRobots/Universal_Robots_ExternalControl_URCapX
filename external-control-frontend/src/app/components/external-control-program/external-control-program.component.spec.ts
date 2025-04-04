import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExternalControlProgramComponent } from "./external-control-program.component";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { RobotSettings } from '@universal-robots/contribution-api';

describe('ExternalControlProgramComponent', () => {
  let fixture: ComponentFixture<ExternalControlProgramComponent>;
  let component: ExternalControlProgramComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalControlProgramComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalControlProgramComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test to ensure the ngOnChanges method updates the translation language EN.
   */
  it('should update translation language on robotSettings change', () => {
    component.robotSettings = { language: 'en', units: null } as RobotSettings;
    component.ngOnChanges({ robotSettings: { currentValue: component.robotSettings } } as any);
    expect(component.currentLanguage).toBe('en');
  });

  /**
   * Test to ensure the ngOnChanges method updates the translation language DA.
   */
  it('should update translation language on robotSettings change', () => {
    component.robotSettings = { language: 'da', units: null } as RobotSettings;
    component.ngOnChanges({ robotSettings: { currentValue: component.robotSettings } } as any);
    expect(component.currentLanguage).toBe('da');
  });

  /**
   * Test to ensure the ngOnChanges method updates the translation language DE.
   */
  it('should update translation language on robotSettings change', () => {
    component.robotSettings = { language: 'de', units: null } as RobotSettings;
    component.ngOnChanges({ robotSettings: { currentValue: component.robotSettings } } as any);
    expect(component.currentLanguage).toBe('de');
  });

  /**
   * Test to ensure the ngOnChanges method sets the default language if the
   * language is not supported.
   */
  it('should set default language to "en" if the language is not supported', () => {
    component.robotSettings = { language: 'qq', units: null } as RobotSettings;
    component.ngOnChanges({ robotSettings: { currentValue: component.robotSettings } } as any);
    expect(component.currentLanguage).toBe('en');
  });
});
