import { Injectable, Type } from "@angular/core";
import { DialogConfig, DialogProvider, DialogRef } from "../models/dialog-provider";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BaseModal } from "../core/base-modal";
import { Observable } from "rxjs";

@Injectable()
export class MatDialogProvider implements DialogProvider {

    constructor(
        private readonly dialog: MatDialog,
    ) { }

    public open<
        Data,
        Config extends DialogConfig<Data>,
        Component extends BaseModal<Data>,
        ReturnData
    >(component: Type<Component>, config: Config): DialogRef<ReturnData> {
        const ref = this.dialog.open(component, config);
        return new MatDialogRefProvider(ref);
    }

}

class MatDialogRefProvider<T, Component> implements DialogRef<T> {

    onClose = this.ref.beforeClosed();

    constructor(
        private readonly ref: MatDialogRef<Component, T>
    ) { }


    public close(data?: T | undefined): void {
        this.ref.close(data);
    }

    public destroy(): void {
    }

}
