import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, signal} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ProgramBehaviorAPI, ProgramPresenter, ProgramPresenterAPI, RobotSettings} from '@universal-robots/contribution-api';
import {first} from 'rxjs/operators';
import {ExternalControlApplicationNode} from 'src/app/components/external-control-application/external-control-application.node';
import {getSupportedLanguages} from 'src/app/components/supported-languages';
import {URCAP_ID, VENDOR_ID} from 'src/generated/contribution-constants';

import {ExternalControlProgramNode} from './external-control-program.node';

@Component({
  templateUrl: './external-control-program.component.html',
  styleUrls: ['./external-control-program.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ExternalControlProgramComponent implements OnChanges,
                                                        ProgramPresenter {
  ipDisplay = signal<string>('unknown');
  portDisplay = signal<number>(0);

  // presenterAPI is optional
  @Input() presenterAPI: ProgramPresenterAPI;
  private _contributedNode: ExternalControlProgramNode;
  // robotSettings is optional
  @Input() robotSettings: RobotSettings;
  // contributedNode is optional
  @Input() contributedNode: ExternalControlProgramNode;

  constructor(
      protected readonly translateService: TranslateService,
      protected readonly cd: ChangeDetectorRef) {}

  async ngOnChanges(changes): Promise<void> {
    if (changes?.robotSettings) {
      if (!changes?.robotSettings?.currentValue) {
        return;
      }

      const supportedLanguages = getSupportedLanguages();
      const language = supportedLanguages.includes(
                           changes?.robotSettings?.currentValue?.language) ?
          changes?.robotSettings?.currentValue?.language :
          'en';

      this.translateService.use(language).pipe(first()).subscribe(() => {
        this.cd.detectChanges();
      });
    }
    if (changes?.presenterAPI?.firstChange && this.presenterAPI) {
      const applicationNode =
          await this.presenterAPI.applicationService.getApplicationNode(
              'universal-robots-external-control-external-control-application') as
          ExternalControlApplicationNode;
      if (applicationNode) {
        this.ipDisplay.set(applicationNode.robotIP);
        this.portDisplay.set(applicationNode.port);
      }

      this.cd.detectChanges();
    }
  }

  // call saveNode to save node parameters
  async saveNode() {
    this.cd.detectChanges();
    await this.presenterAPI.programNodeService.updateNode(this.contributedNode);
  }

  async getPortDisplay() {
    const applicationNode =
        await this.presenterAPI.applicationService.getApplicationNode(
            'universal-robots-external-control-external-control-application') as
        ExternalControlApplicationNode;
    return applicationNode.port
  }

  async getIPDisplay() {
    const applicationNode =
        await this.presenterAPI.applicationService.getApplicationNode(
            'universal-robots-external-control-external-control-application') as
        ExternalControlApplicationNode;
    return applicationNode.robotIP;
  }

  /**
   * Public getter for the current translation language.
   */
  get currentLanguage(): string {
    return this.translateService.currentLang;
  }
}
