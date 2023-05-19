import { InjectionToken } from "@angular/core";
import { DialogProvider } from "./models/dialog-provider";
import { BaseModal, UrlContext, UrlModalService } from "../public-api";

export const DIALOG_PROVIDER_TOKEN = new InjectionToken<DialogProvider>('Dialog provider token');
