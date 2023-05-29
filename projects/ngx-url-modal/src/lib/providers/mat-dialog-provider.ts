import { Injectable, Type } from "@angular/core";
import { DialogConfig, DialogProvider, DialogRef } from "../models/dialog-provider";
import { BaseModal } from "../core/base-modal";
import { Dialog, DialogRef as MatDialogRef } from "@angular/cdk/dialog";

@Injectable()
export class MatDialogProvider implements DialogProvider {

    constructor(
        private readonly dialog: Dialog,
    ) {
    }

    public open<
        Data,
        Config extends DialogConfig<Data>,
        Component extends BaseModal<Data>,
        ReturnData
    >(component: Type<Component>, config: Config): DialogRef<ReturnData> {
        const ref = this.dialog.open<ReturnData, Data, Component>(component, config);
        return new MatDialogRefProvider(ref);
    }

}

class MatDialogRefProvider<T, Component> implements DialogRef<T> {

    onClose = this.ref.closed;

    constructor(
        private readonly ref: MatDialogRef<T, Component>
    ) { }

    public close(data?: T | undefined): void {
        this.ref.close(data);
    }

    public destroy(): void {
    }

}
