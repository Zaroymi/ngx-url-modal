import { Params } from '@angular/router';
import { UrlModal } from './url-modal';

/**
 * Class for creating new url params when modals opened or closed
 * @readonly
 * @param _modalQueryName Query name for opened modals
 * @param _modals Map with all registered url modals
 */
export class UrlModalsQueryParser {

    constructor(
        private readonly _modalQueryName: string,
        private readonly _modals: ReadonlyMap<string, Readonly<UrlModal>>,
    ) { }

    /**
     * Create params for modal opening
     */
    public createModalOpenParams(currentParams: Params, modalName: string): Params {
        const modal = this._modals.get(modalName);

        if (!modal) {
            return currentParams;
        }

        const openedModals = currentParams[this._modalQueryName] as string[] | string | undefined;
        let modalQuery: string[] = [];

        if (openedModals) {
            if (openedModals.includes(modalName)) {
                return currentParams;
            }
            modalQuery = typeof openedModals === 'string' ? [openedModals] : [...openedModals];
        }

        modalQuery.push(modalName);
        const queryParams = {
            ...currentParams,
            ...modal.urlContext?.urlParams,
            modal: this.flatQuery(modalQuery),
        };
        return queryParams;
    }

    /**
     * Create params for modal closing
     */
    public createModalCloseParams(currentParams: Params, modalName: string): Params {
        const modalsQuery = currentParams[this._modalQueryName] as string[] | string | undefined;
        const newModals: string[] = [];

        if (!modalsQuery?.includes(modalName)) {
            return currentParams;
        }

        if (typeof modalsQuery !== 'string') {
            newModals.push(...modalsQuery.filter(name => name !== modalName));
        }

        const queryParams = { ...currentParams } as Params;
        queryParams[this._modalQueryName] = this.flatQuery(newModals);

        return this.removeModalParamFromParams(queryParams, modalName);
    }

    private removeModalParamFromParams(queryParams: Params, modalName: string) {
        const modal = this._modals.get(modalName);

        if (!modal) {
            return queryParams;
        }

        const params = { ...queryParams };
        for (const paramKey of Object.keys(modal.urlContext?.urlParams ?? {})) {
            const required = this.isParamRequiredInOtherModals(modalName, paramKey);

            if (!required && paramKey in queryParams) {
                params[paramKey] = undefined;
            }
        }

        return params;
    }

    /**
     * If length = 0, returns undefined;
     * If length = 1, returns first element;
     * Returns array otherwise;
     */
    private flatQuery(modals: string[]): string[] | string | undefined {
        if (modals.length === 0) {
            return undefined;
        }

        return modals.length === 1 ? modals[0] : modals;
    }

    private isParamRequiredInOtherModals(skipModalName: string, paramName: string) {
        const otherModals = Array.from(this._modals.entries())
            .filter(([name]) => name !== skipModalName)
            .map(([, modal]) => modal);

        return otherModals.some(modal => modal.isOpened
            && modal.urlContext
            && paramName in modal.urlContext.urlParams);
    }

}
