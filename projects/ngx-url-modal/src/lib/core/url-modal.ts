import { ComputeUrlParams } from '../utils/types/compute-url-params';
import { DialogConfig, DialogProvider, DialogRef } from '../models/dialog-provider';
import { StaticContext } from './static-context';
import { Subject, Subscription } from 'rxjs';
import { Type } from '@angular/core';
import { UrlContext } from './url-context';
import { UrlModalEvent, UrlModalEventType } from '../models/url-modal-event';
import { BaseModal } from './base-modal';

/**
 * Representation of modal that can be used with URL query params
 * @param Data - type of data that returns from modal
 * @param ModalContextParams - data that modal component used for correct work = modal config.
 * Extracted from modal component type
 * @param UrlContextParams - data that can be write to URL or compute from URL. Part of `ModalContext`
 * Extracted from `UrlParamsContext` after calling `addUrlContext`
 * @param StaticContextParams - difference between `ModalContext` and `UrlContext`.
 * That is parameters that required in modal but not provided from `UrlContext`.
 * Extracted after calling `addStaticContext`
 *
 * ## Examples of usage
 * ### Initialization
 * **You must to call `addUrlContext` after constructing.**
 * 1. Base initialization. You must to call `addUrlContext` after constructing.
 * ```ts
 * const modal = new UrlModal(Component, dialog).addUrlContext(context)
 * ```
 * 2. Adding static context
 * ```ts
 * const modal = new UrlModal(Component, dialog).addUrlContext(context).addStaticContext(staticContext)
 * ```
 *
 * ### Open/Close. Events
 * You can open/close modal like default modal with `.open()` `.close()` methods.
 * To subscribe to events you should use `.on()` method with callback. Or subsctibe to `events$`
 *
 * ```ts
 *  modal.on('open', onOpen);
 *  modal.on('close', onClose);
 *
 *  modal.open({id: '1'});
 *  modal.close(closedValue);
 * ```
 *
 */
export class UrlModal<
    Data = unknown,
    ModalContextParams extends object = object,
    UrlContextParams extends object = object,
    StaticContextParams = keyof ComputeUrlParams<UrlContextParams> extends
    never ? ModalContextParams : Omit<ModalContextParams, keyof ComputeUrlParams<UrlContextParams>>,
> {

    private readonly _events$ = new Subject<UrlModalEvent<Data>>();


    /**
     * All events from modal
     */
    public readonly events$ = this._events$.asObservable();

    private ref: DialogRef<Data> | undefined = undefined;

    private _closeSub: Subscription | undefined = undefined;

    public urlContext?: UrlContext<UrlContextParams>;

    private staticContext?: StaticContext<StaticContextParams, ModalContextParams>;

    private readonly handlers: Record<UrlModalEventType, Array<(data?: Data) => void>> = {
        open: [],
        close: [],
    };

    public get isOpened() {
        return Boolean(this.ref);
    }


    constructor(
        private readonly component: Type<BaseModal<ModalContextParams>>,
        private readonly dialog: DialogProvider,
    ) {

    }

    /**
     * Add url context to modal. Must be called after consturctor call
     * @returns this
     */
    public addUrlContext<
        Context extends object,
        CompContext extends Partial<ModalContextParams>,
    >(
        context: UrlContext<Context, CompContext>,
    ): UrlModal<Data, ModalContextParams, Context> {
        this.urlContext = context as unknown as UrlContext<UrlContextParams>;
        return this as UrlModal<Data, ModalContextParams, Context>;
    }

    /**
     * Add static context (config) to modal. Can't be used without url context
     * @returns this
     */
    public addStaticContext(
        context: DialogConfig<StaticContextParams>
            | Omit<Record<string, (param: ModalContextParams) => unknown>, 'data'>,
    ) {
        this.staticContext = new StaticContext(context);
        return this;
    }

    /**
     * Open modal with params from url context
     */
    public open(params: Partial<ComputeUrlParams<UrlContextParams>>) {
        if (this.isOpened) {
            return this;
        }

        this.urlContext?.addParams(params);

        if (this.urlContext && !this.urlContext.readyToExecute) {
            // TODO: change to snackbar in dev mode
            // eslint-disable-next-line no-console
            console.error(
                `Tries to open modal without all params. Params:
                 ${JSON.stringify(params)}, expected: ${JSON.stringify(this.urlContext.paramsDeclaration)}`,
            );
            return this;
        }

        const urlData = this.urlContext?.computeParams() ?? {};
        const fullConfig = this.staticContext?.computeParams(urlData) ?? {};

        this.ref = this.dialog.open(this.component, {
            ...fullConfig,
        });

        this._closeSub = this.ref.onClose.subscribe((result: Data) => {
            const event = { type: 'close', data: result } as const;
            this.fireEvent(event);
            this.clear();
        });

        this.fireEvent({ type: 'open' });
        return this;
    }

    /**
     * Closes modal and destroy modal ref
     */
    public close(data?: Data): Data | undefined {
        if (!this.isOpened) {
            return undefined;
        }

        this.ref?.close(data);
        return data;
    }

    /**
     * Cleas all modal resources
     */
    public clear() {
        this.ref?.destroy();
        this.ref = undefined;
        this._closeSub?.unsubscribe();
        this._closeSub = undefined;
    }

    /**
     * Add handler on any modal event
     */
    public on(event: 'close', handler: (data?: Data) => void): this;
    public on(event: 'open', handler: () => void): this;
    public on(event: UrlModalEventType, handler: (data?: Data) => void): this {
        this.handlers[event].push(handler);
        return this;
    }

    private fireEvent(event: UrlModalEvent<Data>) {
        const handlers = this.handlers[event.type];
        for (const handler of handlers) {
            handler(event.data);
        }

        this._events$.next(event);
    }

}
