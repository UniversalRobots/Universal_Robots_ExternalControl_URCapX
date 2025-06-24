import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  providers: [
    {
      provide: 'WORKER_ENVIRONMENT',
      useValue: {
        isWorker: false,
        registerProgramBehavior: () => {},
        ProgramBehaviorAPI: class {
          constructor() {}
          applicationService = {
            getApplicationNode: () => Promise.resolve({
              robotIP: '192.168.1.1',
              port: 8080
            })
          };
        }
      }
    }
  ]
})
export class ExternalControlTestingModule { } 