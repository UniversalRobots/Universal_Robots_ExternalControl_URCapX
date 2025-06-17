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
import { v4 as uuidv4 } from 'uuid';

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
        version: '1.1.0',
        lockChildren: false,
        allowsChildren: false,
        parameters: {
            nodeHash: uuidv4()
        }
    });
};

export const fetchBackendJson = async (port: number, robotIP: string, api: ProgramBehaviorAPI): Promise<any> => {
    const url = api.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'external-control-backend', 'rest-api');
    const backendUrl = `${location.protocol}//${url}/${port}/${robotIP}`;
    console.log("backendUrl", backendUrl);
    const response = await fetch(backendUrl);
    console.log("response", response);
    if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
    }
    return await response.json();
};

export const isThisNodeTheFirstUrcapNodeInTree = async (node: ExternalControlProgramNode, api: ProgramBehaviorAPI): Promise<boolean> => {
    const listOfUrcapNodesInTree = (await api.programTreeService.getContributedNodeInstancesForURCap())
    const filteredListOfUrcapNodesInTree = listOfUrcapNodesInTree.filter(node => !node.node.isSuppressed && node.node.type === 'universal-robots-external-control-external-control-program')
    const sortedListOfUrcapNodesInTree = filteredListOfUrcapNodesInTree.sort((a, b) => a.node.parameters?.nodeHash.localeCompare(b.node.parameters.nodeHash))

    return sortedListOfUrcapNodesInTree.length > 0 && sortedListOfUrcapNodesInTree[0].node.parameters?.nodeHash === node.parameters?.nodeHash;
}

const generateScriptCodeBefore = async (node: ExternalControlProgramNode, ScriptContext: ScriptContext): Promise<ScriptBuilder> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const port = applicationNode.port;
    const robotIP = applicationNode.robotIP;
    const builder = new ScriptBuilder();
    try {
        const json = await fetchBackendJson(port, robotIP, api);
        builder.addRaw(json.program_node || '');
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        builder.addRaw(`popup("${errorMessage}", title="Connection Error!",blocking=True)`);
    }
    return builder;
};

const generateScriptCodeAfter = (node: ExternalControlProgramNode): OptionalPromise<ScriptBuilder> => new ScriptBuilder();

const generatePreambleScriptCode = async (node: ExternalControlProgramNode, ScriptContext: ScriptContext): Promise<ScriptBuilder> => {
    console.log('generatePreambleScriptCode');
    const api = new ProgramBehaviorAPI(self);
    
    const builder = new ScriptBuilder();
    
    if (await isThisNodeTheFirstUrcapNodeInTree(node, api)) {
        // Fetch the preamble from the backend
        const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
        const port = applicationNode.port;
        const robotIP = applicationNode.robotIP;
        try {
            const json = await fetchBackendJson(port, robotIP, api);
            builder.addRaw(json.preamble || '');
        } catch (e) {
            builder.addRaw('');
        }
    } else {
        builder.addRaw('');
    }

    return builder;
};

export const validate = async (node: ExternalControlProgramNode, validationContext: ValidationContext): Promise<ValidationResponse> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const port = applicationNode.port;
    const robotIP = applicationNode.robotIP;
    try {
        const json = await fetchBackendJson(port, robotIP, api);
        return { isValid: !!json.valid, errorMessageKey: json.status};
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        return { isValid: false, errorMessageKey: errorMessage };
    }
};

const allowChildInsert = (node: ProgramNode, childType: string): OptionalPromise<boolean> => true;

const allowedInsert = (insertionContext: InsertionContext): OptionalPromise<boolean> => true;

const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => {
    const upgradedNode = { ...loadedNode };
    
    // Ensure parameters object exists
    if (!upgradedNode.parameters) {
        upgradedNode.parameters = {};
    }
    
    // Add nodeHash if missing
    if (!upgradedNode.parameters.nodeHash) {
        upgradedNode.parameters.nodeHash = uuidv4();
    }
    
    return upgradedNode;
};

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

// Only register behavior if we're in a worker environment
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    registerProgramBehavior(behaviors);
}

export { behaviors }; // Export behaviors for testing
