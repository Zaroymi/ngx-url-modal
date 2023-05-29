import { NgModule } from "@angular/core";
import { DIALOG_PROVIDER_TOKEN } from "./dialog-provider-token";
import { MatDialogProvider } from "../public-api";
import { Dialog } from "@angular/cdk/dialog";

@NgModule({
    providers: [{ provide: DIALOG_PROVIDER_TOKEN, deps: [Dialog], useFactory: (dialog: Dialog) => new MatDialogProvider(dialog) }]
})
export class NgxUrlModalModule {

}
