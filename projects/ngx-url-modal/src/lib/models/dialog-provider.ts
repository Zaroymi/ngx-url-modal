import { Observable } from 'rxjs';
import { Type } from '@angular/core';

export interface DialogConfig<PartialConfigData = unknown, FullConfigData = object > {
    data?: PartialConfigData;
    [value: string]: unknown | ((data: FullConfigData) => unknown);
}

export interface DialogRef<ReturnData> {
    close(data?: ReturnData): void;
    destroy(): void;
    onClose: Observable<ReturnData>;
}

export interface DialogProvider {
    open<
        Component,
        Config extends DialogConfig,
        ReturnData,
    >(
        component: Type<Component>,
        config: Config
    ): DialogRef<ReturnData>;
}
