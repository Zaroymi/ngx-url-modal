import { AnyFunction } from '../utils/types/any-function';
import { ComputeUrlParams } from '../utils/types/compute-url-params';
import { isFunction } from '../utils/is-function';
import { TakeByType } from '../utils/types/take-by-type';
import { UrlParamDeclaration } from '../models/url-params-declaration';

type DefaultDeclaration = Record<string, AnyFunction | UrlParamDeclaration>;

/**
 * Class for providing parametres declarations. Used for declaring and handling URL query params
 *
 * Can declare two types of parametres: `default` and `computed`.
 * 1. `Default` parameters is string only. It can be optional or not.
 * 2. `Computed` parameters can be created by function depends on `default` parameters or another `computed` parameters.
 */
export class UrlContext<
    ParamsDeclaration extends object,
    ComputedParams = ComputeUrlParams<ParamsDeclaration>,
> {

    /**
     * All required (not optional in declaration) parameters are filled.
     */
    public get readyToExecute() {
        const declarations = this.paramsDeclaration as DefaultDeclaration;
        const allRequiredParamsExists = Object.entries(declarations).every(([name, declaration]) => {
            if (isFunction(declaration)) {
                return true;
            }

            const existsInParams = name in this._params;
            return declaration.optional || existsInParams;
        });

        return allRequiredParamsExists;
    }

    /**
     * Params that can be write in URl.
     */
    public get urlParams(): Partial<ComputedParams> {
        const filteredParams = Object.entries(this._params)
            .filter(([, value]) => typeof value === 'string');
        return Object.fromEntries(filteredParams) as Partial<ComputedParams>;
    }

    private _params: Partial<ComputedParams> = {};

    constructor(
        public readonly paramsDeclaration: ParamsDeclaration = {} as ParamsDeclaration,
    ) { }

    /**
     * Set value to `default` parameter by name. Skip if parameter with provided name wasn't previously declared
     */
    public addParam<
        ParamName extends TakeByType<ComputedParams, string>,
        Value extends ComputedParams[ParamName],
    >(
        paramName: ParamName,
        value: Value,
    ) {
        if (!(paramName in this.paramsDeclaration)) {
            return this;
        }

        const params: Partial<ComputedParams> = {};
        params[paramName] = value;
        this._params = { ...this._params, ...params };
        return this;
    }

    /**
     * Set values to `default` parameters by names. Skip if parameter with provided name wasn't previously declared
     */
    public addParams(params: Partial<ComputedParams>) {
        for (const [name, param] of Object.entries(params)) {
            if (name in this.paramsDeclaration) {
                const computedParamName = name as keyof ComputedParams;
                this._params[computedParamName] = param as ComputedParams[keyof ComputedParams];
            }
        }
        return this;
    }

    /**
     * Executed all computed params functions. Store calls results.
     */
    public computeParams(): ComputedParams | undefined {
        if (!this.readyToExecute) {
            return undefined;
        }

        const params = { ...this._params };
        const declaration = this.paramsDeclaration as DefaultDeclaration;

        for (const paramName of Object.keys(declaration)) {
            const selectFunc = declaration[paramName];
            if (!isFunction(selectFunc)) {
                continue;
            }

            const selectedValue = selectFunc(params);
            (params as Record<string, unknown>)[paramName] = selectedValue;
        }

        return params as ComputedParams;
    }

    /**
     * Declare default parameter
     * @returns
     * **WARN** returns new `UrlParamsContext` and not modify current
     */
    public declareParam<ParamName extends string>(param: ParamName, optional = true) {
        const newDeclaration = { [param]: { optional } } as Record<ParamName, UrlParamDeclaration>;
        const declaration = Object.assign(newDeclaration, this.paramsDeclaration);
        return new UrlContext(declaration);
    }

    /**
     * Declare computed parameter
     * @param param Parameter name
     * @param selectFunction function that will be executed after `computeParams` calling.
     * @returns
     * **WARN** returns new `UrlParamsContext` and not modify current
     */
    public declareComputedParam<
        ParamName extends string,
        ParamType,
    >(
        param: ParamName,
        selectFunction: (params: ComputedParams) => ParamType,
    ) {
        const newDeclaration = { [param]: selectFunction } as Record<ParamName, typeof selectFunction>;
        const declaration = Object.assign(newDeclaration, this.paramsDeclaration);
        return new UrlContext(declaration);
    }

}
