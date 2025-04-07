/// <reference lib="webworker" />
import {
    ApplicationContext,
    AdvancedTranslatedProgramLabel,
    AdvancedProgramLabel,
    ProgramBehaviorAPI,
    InsertionContext,
    OptionalPromise,
    ProgramBehaviors,
    ProgramNode,
    registerProgramBehavior,
    ScriptBuilder, ScriptContext,
    ValidationContext,
    ValidationResponse
} from '@universal-robots/contribution-api';
import { ExternalControlProgramNode } from './external-control-program.node';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { ExternalControlApplicationNode } from '../external-control-application/external-control-application.node';

const createProgramNodeLabel = async (node: ExternalControlProgramNode): Promise<AdvancedTranslatedProgramLabel> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const programLabel: AdvancedTranslatedProgramLabel = [];

    programLabel.push({
        type: 'primary',
        translationKey: 'presenter.cache-label',
        interpolateParams: {
            ip: `${applicationNode.robotIP}`,
            port: `${applicationNode.port}`
        }
    });
    return programLabel;
};

const createProgramNode = async (): Promise<ExternalControlProgramNode> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    return ({
        type: 'universal-robots-external-control-external-control-program',
        version: '1.0.0',
        lockChildren: false,
        allowsChildren: false,
    });
};

const generateScriptCodeBefore = async (node: ExternalControlProgramNode, ScriptContext: ScriptContext): Promise<ScriptBuilder> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const port = applicationNode.port;
    const robotIP = applicationNode.robotIP;
    const builder = new ScriptBuilder();
    const url = api.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'external-control-backend', 'rest-api');
    const backendUrl = `${location.protocol}//${url}/${port}/${robotIP}`;
    const response = await fetch(backendUrl);
    const program = await response.text();
    console.log(`Fetch response:`, program);
    // Checks the status code of fetch response for 200
    if (response.status == 500) {
        builder.addRaw('popup("Could not establish connection due to a server error. Please check your host IP address and port number, and ensure that your external program is running.", title="Connection Error!",blocking=True)');
    } else if (response.status == 502) {
        builder.addRaw('popup("Could not establish connection due to a gateway error. Please ensure your Flask server is running properly, and try again.", title="Connection Error!",blocking=True)');
    } else if (response.status != 200) {
        builder.addRaw('popup("Could not establish connection due to a server error. Please check your host IP address and port number, and ensure that your external program is running.", title="Connection Error!",blocking=True)');
    } else {
        builder.addRaw(program);
    }
    return builder;
};

const generateScriptCodeAfter = (node: ExternalControlProgramNode): OptionalPromise<ScriptBuilder> => new ScriptBuilder();

const generatePreambleScriptCode = async (node: ExternalControlProgramNode, ScriptContext: ScriptContext): Promise<ScriptBuilder> => {
    const builder = new ScriptBuilder();
    return builder;
};

const validate = (node: ExternalControlProgramNode, validationContext: ValidationContext): OptionalPromise<ValidationResponse> => ({
    isValid: true
});

const allowChildInsert = (node: ProgramNode, childType: string): OptionalPromise<boolean> => true;

const allowedInsert = (insertionContext: InsertionContext): OptionalPromise<boolean> => true;

const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => loadedNode;

const behaviors: ProgramBehaviors = {
    programNodeLabel: createProgramNodeLabel,
    factory: createProgramNode,
    generateCodeBeforeChildren: generateScriptCodeBefore,
    generateCodeAfterChildren: generateScriptCodeAfter,
    generateCodePreamble: generatePreambleScriptCode,
    validator: validate,
    allowsChild: allowChildInsert,
    allowedInContext: allowedInsert,
    upgradeNode: nodeUpgrade
};

registerProgramBehavior(behaviors);
