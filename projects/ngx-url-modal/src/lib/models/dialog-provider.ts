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
        Data,
        Config extends DialogConfig<Data>,
        Component extends Type<BaseModal<Data>>,
        ReturnData,
    >(
        component: Component,
        config: Config
    ): DialogRef<ReturnData>;
}
