import { NgModule } from "@angular/core";
import { DIALOG_PROVIDER_TOKEN } from "./dialog-provider-token";
import { MatDialogProvider } from "../public-api";
import { MatDialog } from "@angular/material/dialog";

@NgModule({
    providers: [{ provide: DIALOG_PROVIDER_TOKEN, deps: [MatDialog], useFactory: (dialog: MatDialog) => new MatDialogProvider(dialog) }]
})
export class NgxUrlModalModule {

}
