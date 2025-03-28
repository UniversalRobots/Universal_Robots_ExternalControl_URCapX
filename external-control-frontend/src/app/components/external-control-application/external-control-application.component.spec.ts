/**
 * Contains unit tests for the ExternalControlApplicationComponent.
 * It ensures that the component is created correctly and its functionalities
 * work as expected.
 */
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {Observable, of} from 'rxjs';
import {ExternalControlApplicationComponent} from './external-control-application.component';
import { RobotSettings } from '@universal-robots/contribution-api';

describe('ExternalControlApplicationComponent', () => {
  let fixture: ComponentFixture<ExternalControlApplicationComponent>;
  let component: ExternalControlApplicationComponent;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed
        .configureTestingModule({
          declarations: [ExternalControlApplicationComponent],
          imports: [TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useValue: {
                getTranslation(): Observable<Record<string, string>> {
                  return of({});
                }
              }
            }
          })],
          providers: [
            provideHttpClient(withInterceptorsFromDi()),
            provideHttpClientTesting()
          ],
        })
        .compileComponents();

    fixture = TestBed.createComponent(ExternalControlApplicationComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
  });

  /**
   * Test to ensure the component is created successfully.
   */
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test to ensure the component initializes with default values.
   */
  it('should initialize with default values', () => {
    expect(component.baseTranslationKey)
        .toBe(
            'application.nodes.universal-robots-external-control-external-control-application');
    expect(component.messageEmitter$.value).toBe('');
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
