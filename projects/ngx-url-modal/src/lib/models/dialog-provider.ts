import { Observable } from 'rxjs';
import { Type } from '@angular/core';
import { BaseModal } from '../core/base-modal';

export interface DialogConfig<PartialConfigData = unknown, FullConfigData = object> {
    data?: PartialConfigData;
    [value: string]: unknown | ((data: FullConfigData) => unknown);
}

export interface DialogRef<ReturnData> {
    close(data?: ReturnData): void;
    destroy(): void;
    onClose: Observable<ReturnData | undefined>;
}

export interface DialogProvider {
    open<
        Config extends DialogConfig,
        Component extends BaseModal<Config>,
        ReturnData,
    >(
        component: Type<Component>,
        config: Config
    ): DialogRef<ReturnData>;
}
