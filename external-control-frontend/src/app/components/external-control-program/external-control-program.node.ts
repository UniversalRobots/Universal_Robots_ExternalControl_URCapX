import { ProgramNode } from '@universal-robots/contribution-api';

export interface ExternalControlProgramNode extends ProgramNode {
    type: 'universal-robots-external-control-external-control-program';
    lockChildren?: boolean;
    allowsChildren?: boolean;
    parameters: {
        nodeHash: string;
    }
}
