import { NgModule } from "@angular/core";
import { DIALOG_PROVIDER_TOKEN } from "./dialog-provider-token";
import { MatDialogProvider } from "../public-api";

@NgModule({
    providers: [{ provide: DIALOG_PROVIDER_TOKEN, useClass: MatDialogProvider }]
})
export class NgxUrlModalModule {

}
