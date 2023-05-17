import { NgModule } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { DIALOG_PROVIDER_TOKEN } from "./dialog-provider-token";

@NgModule({
  providers: [{ provide: DIALOG_PROVIDER_TOKEN, useExisting: MatDialog }]
})
export class NgxUrlModalModule {

}
