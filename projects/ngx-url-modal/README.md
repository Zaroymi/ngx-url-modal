# Ngx UrlModal

Angular library for keeping modal window state in URL

## Installation

```bash
npm install ngx-url-modal
```

### MatDialog

Library uses **MatDialog** by default. You must be sure that you have installed necessary packages.
```bash 
npm install @angular/material
npm install @angular/cdk
```

After packages installation you should import `NgxUrlModalModule` module to your app

```ts
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    NgxUrlModalModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

```


## Usage

### Configure modal component
1. Create new or use existing one component
2. Extend component from `BaseModal` class with modal required data as first parameter  
**Example**
```ts
interface ModalData {
    id: string;
}

@Component({...})
class MyComponent extends BaseModal<ModalData> {
    constructor() {
        super();
    }
} 
```

### Configure `UrlModalService`
1. Provide `UrlModalService` in component (recommended way) or in module. **Important** if you provide in module, clear this service in `ngOnDestroy`
2. Configure modal, by `registerModal` method call
   1. Create [UrlContext](#urlcontext) and call `addUrlContext`
   2. Create [StaticContext](#staticcontext) and call `addStaticContext`;
3. Register page by providing `ActivatedRoute` by `registerPage` method call

**Example**
```ts
@Component({
    ...
    providers: [UrlModalService]
})
export class PageComponent implements OnInit {

    constructor(
        public readonly users: UserService,
        public readonly modal: UrlModalService,
        private readonly route: ActivatedRoute,
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
            });

        this.modal.registerPage(this.route);
    }

```

## API

### UrlContext

### StaticContext

### UrlModalServivce

### UrlModal

## Features

## Roadmap
