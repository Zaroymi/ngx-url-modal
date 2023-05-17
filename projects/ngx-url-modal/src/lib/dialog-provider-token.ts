import { InjectionToken } from "@angular/core";
import { DialogProvider } from "./models/dialog-provider";

export const DIALOG_PROVIDER_TOKEN = new InjectionToken<DialogProvider>('Dialog provider token', );
