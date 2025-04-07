import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { ExternalControlProgramComponent } from './components/external-control-program/external-control-program.component';
import { ExternalControlApplicationComponent } from './components/external-control-application/external-control-application.component';
import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import { PATH } from '../generated/contribution-constants';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' }
    ]);

@NgModule({
    declarations: [
        ExternalControlProgramComponent,
        ExternalControlApplicationComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIAngularComponentsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpBackend] },
            useDefaultLang: false,
        })
    ],
    providers: [],
})

export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
    }

    ngDoBootstrap() {
        const externalcontrolprogramComponent = createCustomElement(ExternalControlProgramComponent, {injector: this.injector});
        customElements.define('universal-robots-external-control-external-control-program', externalcontrolprogramComponent);
        const externalcontrolapplicationComponent = createCustomElement(ExternalControlApplicationComponent, {injector: this.injector});
        customElements.define('universal-robots-external-control-external-control-application', externalcontrolapplicationComponent);
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        new Worker(new URL('./components/external-control-application/external-control-application.behavior.worker.ts'
            /* webpackChunkName: "external-control-application.worker" */, import.meta.url), {
            name: 'external-control-application',
            type: 'module'
        });
        new Worker(new URL('./components/external-control-program/external-control-program.behavior.worker.ts'
            /* webpackChunkName: "external-control-program.worker" */, import.meta.url), {
            name: 'external-control-program',
            type: 'module'
        });
    }
}

