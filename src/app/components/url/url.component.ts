import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseModal } from 'ngx-url-modal';
import { UserModalConfig } from 'src/app/models/user-modal-config';

@Component({
    selector: 'app-url',
    templateUrl: './url.component.html',
    styleUrls: ['./url.component.scss']
})
export class UrlComponent extends BaseModal<UserModalConfig> {

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public readonly config: UserModalConfig,
    ) {

        super();
    }
}
