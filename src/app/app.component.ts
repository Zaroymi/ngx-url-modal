import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { UrlContext, UrlModalService } from 'ngx-url-modal';
import { ActivatedRoute } from '@angular/router';
import { UrlComponent } from './components/url/url.component';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [UrlModalService]
})
export class AppComponent implements OnInit {

    constructor(
        public readonly users: UserService,
        private readonly route: ActivatedRoute,
        public readonly modal: UrlModalService
    ) {
    }

    ngOnInit(): void {
        const urlContext = new UrlContext()
            .declareParam('userId')
            .declareComputedParam('user', params => {
                return this.users.getUserById(params.userId);
            });

        this.modal.registerModal('user', UrlComponent)
            .addUrlContext(urlContext)
            .addStaticContext({
                width: '400px',
                height: '800px',
                panelClass: params => {
                    const css = Number(params.user.id) % 2 === 0 ? 'red-backgroud' : '';
                    console.log(css);
                    return css;
                }
            });


        this.modal.registerPage(this.route);
    }

}
