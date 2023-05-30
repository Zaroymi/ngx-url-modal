import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxUrlModalModule } from 'ngx-url-modal';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog'
import { CommonModule } from '@angular/common';
import { UrlComponent } from './components/url/url.component';

@NgModule({
    declarations: [
        AppComponent,
        UrlComponent,
    ],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        MatDialogModule,
        NgxUrlModalModule,
        MatButtonModule,
        BrowserAnimationsModule,
        MatDialogModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
