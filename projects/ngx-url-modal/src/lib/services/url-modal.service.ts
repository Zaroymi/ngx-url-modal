import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { Inject, Injectable, OnDestroy, Type } from '@angular/core';
import { UrlModal } from '../core/url-modal';
import { UrlModalEventType } from '../models/url-modal-event';
import { UrlModalsQueryParser } from '../core/url-modal-query-parser';
import { BaseModal } from '../core/base-modal';
import { DialogProvider } from '../models/dialog-provider';
import { DIALOG_PROVIDER_TOKEN } from '../dialog-provider-token';

interface NavigationTask<T = unknown> {
    type: 'close' | 'open';
    modal: UrlModal;
    taskParams: Promise<NavigationExtras | undefined>;
    taskPromise: Promise<UrlModal<T>>;
    resolveTask(modal: UrlModal): void;
}

/**
 * Service for controling URL modals.
 * Allows:
 * 1. Register Url modals and page, that modals bind to.
 * 2. Open and close Url modals
 * 3. Subscribe to modals events
 *
 * ## Usage
 * 1. You should provide service to any component. Providing exactly to component very important
 * because service has resources that should be cleared after page disposed. Or you can control it manually
 * calling `clear()` method
 * 2. Create you modal component. It must be extended from `BaseModal<T>`, where T - is data, that will be
 * injected to component via config.
 * 3. Register your modal by name and component.
 * 4. Configure your modal by context. @see UrlModal `addStaticContext` `addUrlContext`
 * 5. Register page after registration of all modals by `ActivatedRoute`
 * 6. Enjoy!
 *
 * ```ts
 * @Component(
 *     providers: [UrlModalService]
 * )
 * class MyPage implements OnInit {
 *
 *    constructor(
 *        private modals: UrlModalService,
 *        private route: ActivatedRoute,
 *    ) {}
 *
 *    public ngOnInit() {
 *        const staticContext = {};
 *        const urlContext = new UrlParamsContext().declareParam('id');
 *        this.modals.registerModal('modal', MyModal)
 *            .addUrlContext(urlContext)
 *            .addStaticContext(staticContext);
 *
 *        this.modals.registerPage(this.route);
 *    }
 *
 * }
 *
 * ```
 * ## Order of executing
 * All manual open/close events executs in order of there calling. E.g.
 * ```ts
 * service.open('modal1');
 * service.open('modal2');
 * service.close('modal2');
 * service.close('modal1');
 * ```
 *
 * Execution order - modal1 opens, modal2 opens, modal2 closes, modal1 closes.
 */
@Injectable()
export class UrlModalService implements OnDestroy {

    private _pageRoute: ActivatedRoute | undefined;

    private readonly _modals = new Map<string, UrlModal>();

    private readonly _modalQueryName = 'modal';

    private readonly _queryParser = new UrlModalsQueryParser(
        this._modalQueryName,
        this._modals,
    );

    private readonly _navigationTasks: NavigationTask[] = [];

    private _taskInterval: number | undefined;

    private _executingTask: Promise<boolean> | undefined;

    private readonly _noPageRouteText = 'Provide page by `registerPage` method before calling any modal`s actions';

    private _queryParamsSub: Subscription | undefined;

    constructor(
        @Inject(DIALOG_PROVIDER_TOKEN)
        private readonly _dialog: DialogProvider,
        private readonly _router: Router,
    ) { }

    /**
     * Page registering. Must be called after modal registration
     * **Note** If this method will be called before modals registration,
     * there are no guarantee that modal opens by url after initiation
     * @returns this
     */
    public registerPage(route: ActivatedRoute) {
        this._pageRoute = route;

        this._queryParamsSub = route.queryParams.subscribe(query => {
            const modalsNames = query[this._modalQueryName] as string[] | string | undefined;
            if (!modalsNames) {
                return;
            }

            for (const [name, modal] of this._modals.entries()) {
                if (modalsNames.includes(name)) {
                    modal.open(query);
                } else if (modal.isOpened) {
                    modal.close();
                }
            }
        });

        this._taskInterval = setInterval(() => this.processTask(), 1) as unknown as number;

        return this;
    }

    /**
     * Modal registering. Create new `UrlModal` and store it in service.
     * @returns new UrlModal that should be configured
     */
    public registerModal<
        ReturnData extends object,
        ConfigType extends object = object,
    >(
        modalName: string,
        component: Type<BaseModal<ConfigType>>,
    ) {
        if (this._modals.has(modalName)) {
            throw new Error('Don`t register modal with same name twice');
        }

        const modal = new UrlModal<ReturnData, ConfigType>(component, this._dialog);
        this._modals.set(modalName, modal as UrlModal);

        modal.on('open', () => {
            this.createNavigationTask('open', modalName, modal as UrlModal);
        });

        modal.on('close', () => {
            this.createNavigationTask('close', modalName, modal as UrlModal);
        });

        return modal;
    }

    /**
     * Manual open modal with params
     */
    public open<T extends Record<string, string | undefined>>(modalName: string, params: T) {
        if (!this._pageRoute) {
            throw new Error(this._noPageRouteText);
        }

        const modal = this._modals.get(modalName);
        if (!modal) {
            return undefined;
        }

        modal.open(params);
        const task = this.createNavigationTask('open', modalName, modal);

        return task.taskPromise;
    }

    /**
     * Manual close modal with data
     */
    public close<Data>(modalName: string, data?: Data): Promise<UrlModal<Data>> | undefined {
        if (!this._pageRoute) {
            throw new Error(this._noPageRouteText);
        }

        const modal = this._modals.get(modalName) as UrlModal<Data>;
        if (!Boolean(modal)) {
            return undefined;
        }

        modal.close(data);
        const task = this.createNavigationTask('close', modalName, modal);

        return task.taskPromise;
    }

    /**
     * Subscribe to any modal event
     * @returns Observable with modal events
     */
    public on<Data>(modalName: string, event: UrlModalEventType) {
        const modal = this._modals.get(modalName) as UrlModal<Data>;
        if (!Boolean(modal)) {
            return undefined;
        }

        return modal.events$.pipe(
            filter(({ type }) => type === event),
        );
    }

    /**
     * Clears all resources
     */
    public clear() {
        for (const modal of this._modals.values()) {
            modal.clear();
        }
        clearInterval(this._taskInterval);
        this._modals.clear();
        this._queryParamsSub?.unsubscribe();
    }

    public ngOnDestroy() {
        this.clear();
    }

    private async createOpenParams(modalName: string): Promise<NavigationExtras> {
        if (!this._pageRoute) {
            throw new Error(this._noPageRouteText);
        }

        const currentParams = await firstValueFrom(this._pageRoute.queryParams);

        const queryParams = this._queryParser.createModalOpenParams(currentParams, modalName);

        return { queryParams };
    }

    private async createCloseParams(modalName: string): Promise<NavigationExtras> {
        if (!this._pageRoute) {
            throw new Error(this._noPageRouteText);
        }

        const currentParams = await firstValueFrom(this._pageRoute.queryParams);

        const queryParams = this._queryParser.createModalCloseParams(currentParams, modalName);

        return { queryParams };
    }

    private async processTask() {
        if (this._executingTask || this._navigationTasks.length === 0) {
            return;
        }

        const task = this._navigationTasks.shift();

        if (!task) {
            return;
        }

        const params = await task.taskParams;

        if (params) {
            this._executingTask = this._router.navigate([], params);
            await this._executingTask;
            this._executingTask = undefined;
            task.resolveTask(task.modal);
        }
    }

    private createNavigationTask<T>(type: 'close' | 'open', modalName: string, modal: UrlModal<T>): NavigationTask<T> {
        const taskParams = type === 'close' ? this.createCloseParams(modalName) : this.createOpenParams(modalName);

        let resolveTask: (modal: UrlModal) => void = () => { };
        const taskPromise = new Promise<UrlModal>(resolve => {
            resolveTask = resolve;
        });

        const task = {
            type,
            taskParams,
            modal,
            taskPromise,
            resolveTask,
        } as NavigationTask<T>;

        this._navigationTasks.push(task as NavigationTask);

        return task;

    }

}
