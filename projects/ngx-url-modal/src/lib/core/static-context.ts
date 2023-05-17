import { ComputeParams } from '../utils/types/compute-params';
import { DialogConfig } from '../models/dialog-provider';
import { isFunction } from '../utils/is-function';

/**
 * Represents static context of Url modal
 */
export class StaticContext<
    StaticContextParams,
    ModalContextParams extends object,
    ComputedDialogConfig extends ComputeParams<DialogConfig<StaticContextParams, ModalContextParams>>
    = ComputeParams<DialogConfig<StaticContextParams, ModalContextParams>>,
> {

    constructor(
        public readonly baseConfig: DialogConfig<StaticContextParams, ModalContextParams>,
    ) { }

    /**
     * Computes static context from computed url context. As result - full Url Modal cofig
     */
    public computeParams(modalParams: Partial<ModalContextParams>): ComputedDialogConfig {
        const result: Record<string, unknown> = {};

        const data = { ...this.baseConfig.data, ...modalParams };
        const fullConfig = { ...this.baseConfig, data };

        for (const [name, value] of Object.entries(fullConfig)) {
            const paramValue = isFunction(value) ? value(data) : value;
            result[name] = paramValue;
        }
        return result as ComputedDialogConfig;
    }

}
