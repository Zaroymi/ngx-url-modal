# Ngx Url Modal

NgxUrlModal is an Angular library that enables you to save and restore the state of modal windows in the URL query parameters. It provides a seamless way to store data in the query parameters, allowing the modal state to be preserved even after page reloads. With NgxUrlModal, you can easily create and manage modals with dynamic parameters, providing a consistent user experience and easy sharing of modal states via URLs

## Installation

```bash
npm install ngx-url-modal
```

### Dialog

Library uses [**Dialog**](https://material.angular.io/cdk/dialog/overview) by default. You must be sure that you have installed necessary packages.
```bash 
npm install @angular/cdk
```

After packages installation you should import `NgxUrlModalModule` module to your app

```ts
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    DialogModule,
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
    constructor(
        @Inject(DIALOG_DATA)
        public readonly data: ModalData,
    ) {
        super();
    }
} 
```

### Configure `UrlModalService`
1. Provide [`UrlModalService`](#urlmodalservivce) in component (recommended way) or in module. **Important** if you provide in module, clear this service in `ngOnDestroy`
2. Configure modal, by `registerModal` method call
   1. Create [UrlContext](#urlcontext) and call `addUrlContext`
   2. Create [StaticContext](#staticcontext) and call `addStaticContext`;
3. Register page by providing `ActivatedRoute` by `registerPage` method call

#### **Configuration Example**
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

### UrlModalServivce
Service for controlling URL modals. It allows registering URL modals and pages, opening and closing URL modals, and subscribing to modal events


#### Usage

1. Provide the service to any component. It's important to provide the service directly to the component because the service has resources that should be cleared after the page is disposed. Alternatively, you can manually control resource clearing by calling the `clear()` method.
2. Create your modal component. It must be extended from `BaseModal<T>`, where `T` is the data that will be injected into the component via the configuration.
3. Register your modal by name and component using the `registerModal` method.
4. Configure your modal by adding contexts using the `addStaticContext` and `addUrlContext` methods of the `UrlModal` class.
5. Register the page after registering all the modals by calling the `registerPage` method with the `ActivatedRoute`.

```typescript
@Component({
    providers: [UrlModalService]
})
class MyPage implements OnInit {

    constructor(
        private modals: UrlModalService,
        private route: ActivatedRoute,
    ) {}

    public ngOnInit() {
        const staticContext = {};
        const urlContext = new UrlParamsContext().declareParam('id');
        this.modals.registerModal('modal', MyModal)
            .addUrlContext(urlContext)
            .addStaticContext(staticContext);

        this.modals.registerPage(this.route);
    }

}
```

#### Methods
- #### `registerPage(route: ActivatedRoute): UrlModalService`  
Registers the page. This method must be called after modal registration. If called before modal registration, there is no guarantee that modals will open via URL after initialization.
- #### `registerModal<ReturnData, ConfigType>(modalName: string, component: Type<BaseModal<ConfigType>>): UrlModal`  
Registers a modal by name and component. It creates a new UrlModal and stores it in the service.
  - `modalName`: The name of the modal.
  - `component`: The component class representing the modal.

- #### `open<T>(modalName: string, params: T): Promise<UrlModal<T> | undefined>`  
Manually opens a modal with parameters.

  - `modalName`: The name of the modal.
  - `params`: The parameters to pass to the modal.
Throws an error if the page is not registered before calling any modal actions.  
Returns a promise that resolves to the opened UrlModal instance or undefined if the modal is not found.

- #### `close<Data>(modalName: string, data?: Data): Promise<UrlModal<Data>> | undefined`
Manually closes a modal with optional data.
  - `modalName`: The name of the modal.
  - `data (optional)`: The data to pass to the modal on closing.
Throws an error if the page is not registered before calling any modal actions.  
Returns a promise that resolves to the closed UrlModal instance or undefined if the modal is not found.

- #### `on<Data>(modalName: string, event: UrlModalEventType): Observable<UrlModalEvent<Data>> | undefined`  
Subscribes to a specific modal event.

  - `modalName`: The name of the modal.
  - `event`: The event type to subscribe to.  
Returns an observable that emits the specified modal events or undefined if the modal is not found.

- `clear(): void`  
Clears all resources used by the UrlModalService.

### UrlContext
Class for providing parametres declarations. Used for declaring and handling URL query param  
The `declareParam` and `declareComputedParam` methods are used to declare parameters in the `UrlContext`. The `declareParam` method is used for declaring URL qury parameters, while the `declareComputedParam` method is used for declaring parametes that should be computed with some function from another params. By using these methods, you can define the parameters that will be used in the URL and specify their optional or required status.

- #### `declareParam(param: string, optional?: boolean): UrlContext<ParamsDeclaration, ComputedParams>`  
  Declares a query parameter.

  - `param`: The name of the parameter.
  - `optional` (optional): Specifies whether the parameter is optional. Defaults to `true`

- #### `declareComputedParam(param: string, selectFunction: (params: ComputedParams) => ParamType): UrlContext<ParamsDeclaration, ComputedParams>`
  Declares a computed parameter.

  - `param`: The name of the parameter.
  - `selectFunction`: The function that will be executed after calling `computeParams`. It takes the computed parameters as input.


Note that when declaring computed parameters, you need to provide a function that will be executed after calling `computeParams`. This function takes the computed parameters as input and returns the computed parameter value.


### StaticContext

The StaticContext is similar to [modal config  DialogConfig](https://material.angular.io/cdk/dialog/api#DialogConfig) but with additional features such as field computing. It allows you to provide static configuration options for your modal, such as width, height, or any other properties that you want to set for the modal window.

#### Usage
You can:
1. Provide modal display config.
2. Provide modal data that should not to be store or compute from URL by  `data` field.
3. Compute any field in config with all modal params.
    
Full example with modal from [previous example](#configure-example) 
```ts
this.modal.registerModal('user', UrlComponent)
            .addUrlContext(urlContext)
            .addStaticContext({
                width: '400px',
                height: '800px',
                panelClass: params => params.user ? 'edit' : 'create',
                data: {
                    userNumber: 1
                }
            });
```
## Roadmap
- [ ] Fullfill the documentation
- [ ] Create live demo
- [ ] More testing and bugfixes
- [ ] Support PrimeNG
- [ ] Support async operations before modal opens   
