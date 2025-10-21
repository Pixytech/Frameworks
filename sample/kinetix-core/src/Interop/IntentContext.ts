
export interface IntentContext {
    readonly type: string;
    readonly name?: string;
    readonly data?: {
        [x: string]: string;
    };
    readonly target?: any;
}

export const callerIdentity ="callerIdentity"
