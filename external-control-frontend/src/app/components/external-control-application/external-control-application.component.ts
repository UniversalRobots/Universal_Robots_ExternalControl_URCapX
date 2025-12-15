/**
 * Handling the external control application logic.
 * It manages the interaction between the frontend and the backend, handles translations,
 * and updates the view based on changes in the robot settings.
 */
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ApplicationPresenterAPI, ApplicationPresenter, RobotSettings } from '@universal-robots/contribution-api';
import { ExternalControlApplicationNode } from './external-control-application.node';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getSupportedLanguages } from 'src/app/components/supported-languages';

@Component({
    selector: 'app-external-control-application',
    templateUrl: './external-control-application.component.html',
    styleUrls: ['./external-control-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false,
})
export class ExternalControlApplicationComponent implements ApplicationPresenter, OnChanges {

    @Input() applicationAPI: ApplicationPresenterAPI;
    messageEmitter$ = new BehaviorSubject<string>('');
    httpOptions: {
        headers?:
        | HttpHeaders
        | {
            [header: string]: string | string[];
        };
        observe?: 'body' | undefined;
        responseType?: 'json' | undefined;
    };

    @Input() robotSettings: RobotSettings;

    @Input() applicationNode: ExternalControlApplicationNode;
    private readonly backendProtocol = location.protocol;
    private backendUrl: string;
    baseTranslationKey = 'application.nodes.universal-robots-external-control-external-control-application';

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef,
        protected readonly httpClient: HttpClient
    ) {
        const headers = new HttpHeaders();
        headers.append('Accept', 'text/html');
        this.httpOptions = {
            headers,
            observe: 'body',
            responseType: 'json',
        };
    }

    /**
     * Handles changes in the input properties of the component.
     * Specifically, it updates the translation language based on the robot settings.
     * @param changes - The changes in the input properties.
     */
    ngOnChanges(changes): void {
        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            const supportedLanguages = getSupportedLanguages();
            const language = supportedLanguages.includes(changes?.robotSettings?.currentValue?.language)
                ? changes?.robotSettings?.currentValue?.language
                : 'en';

            this.translateService
                .use(language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });

            if (this.applicationAPI) {
                this.backendUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'external-control-backend', 'rest-api');
            }
        }
    }

    writeParam(port: number, robotIP: string): void {
        this.applicationNode.port = port;
        this.applicationNode.robotIP = robotIP;
        this.saveNode();
    }

    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }

    /**
     * Public getter for the current translation language.
     */
    get currentLanguage(): string {
        return this.translateService.currentLang;
    }
}
