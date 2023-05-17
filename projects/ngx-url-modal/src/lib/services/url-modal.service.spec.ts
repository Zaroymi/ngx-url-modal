import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { UrlModalService } from './url-modal.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component, NgZone } from '@angular/core';
import { UrlContext } from '../core/url-context';
import { BaseModal } from '../core/base-modal';
import { NgxUrlModalModule } from '../ngx-url-modal.module';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';

describe('ModalUrlService', () => {
    let service: UrlModalService;
    let fixture: ComponentFixture<StubComponent>;
    let zone: NgZone;

    @Component({
        selector: 'stub',
        template: '',
    })
    class StubComponent {
        constructor(
            public readonly route: ActivatedRoute
        ) { }
    }

    @Component({
        selector: 'modal',
        template: '',
    })
    class StubModal extends BaseModal<{ id: string }> {

    }

    function getUrlContext(paramName = 'id') {
        return new UrlContext().declareParam(paramName);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StubComponent],
            imports: [MatDialogModule, NgxUrlModalModule, RouterTestingModule],
            providers: [UrlModalService]
        });

        fixture = TestBed.createComponent(StubComponent);
        zone = TestBed.inject(NgZone);
        service = TestBed.inject(UrlModalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register page', () => {
        // Arrange
        const route = fixture.componentInstance.route;

        // Act
        zone.run(() => {
            service.registerPage(route);
        });

        // Assert
        expect().nothing();
    });

    it('should register modal', () => {
        // Arrange

        // Act
        const modal = service.registerModal('stub', StubModal);

        // Assert
        expect(modal).toBeTruthy();
    });

    it('should open modal by service', fakeAsync(() => {
        // Arrange
        const route = fixture.componentInstance.route;
        const urlContext = getUrlContext();

        // Act

        zone.run(() => {
            service.registerModal('stub', StubModal)
                .addUrlContext(urlContext);
            service.registerPage(route);
            service.open('stub', { id: 'id' });
            tick(100);
        });
        tick();
        fixture.detectChanges();

        const snapshot = route.snapshot.queryParams;

        service.clear();
        flush();

        // Assert
        expect(snapshot['id']).toEqual('id');
        expect(snapshot['modal']).toEqual('stub');
    }));

    it('should open two modals by service', fakeAsync(() => {
        // Arrange
        const route = fixture.componentInstance.route;
        const param1 = 'id1';
        const param2 = 'id2';
        const urlContext1 = getUrlContext(param1);
        const urlContext2 = getUrlContext(param2);
        const modalName1 = 'stub1';
        const modalName2 = 'stub2';

        // Act

        zone.run(() => {
            service.registerModal(modalName1, StubModal)
                .addUrlContext(urlContext1);

            service.registerModal(modalName2, StubModal)
                .addUrlContext(urlContext2);

            service.registerPage(route);
            service.open(modalName1, { id1: 'id1' });
            tick(100);
            service.open(modalName2, { id2: 'id2' });
            tick(100);
        });
        tick();

        const snapshot = route.snapshot.queryParams;

        service.clear();
        flush();


        // Assert
        expect(snapshot['id1']).toEqual('id1');
        expect(snapshot['id2']).toEqual('id2');
        expect(snapshot['modal']).toEqual([modalName1, modalName2]);
    }));

    it('should open modal by by implicit call modal.open', fakeAsync(() => {
        // Arrange
        const route = fixture.componentInstance.route;
        const urlContext = getUrlContext();
        const modalName = 'stub';

        // Act

        zone.run(() => {
            const modal = service.registerModal(modalName, StubModal)
                .addUrlContext(urlContext);

            service.registerPage(route);
            modal.open({ id: 'id' });
            tick(100);
        });
        tick();

        const snapshot = route.snapshot.queryParams;

        service.clear();
        flush();


        // Assert
        expect(snapshot['id']).toEqual('id');
        expect(snapshot['modal']).toEqual(modalName);
    }));

    it('should close modal', fakeAsync(() => {
        // Arrange
        const route = fixture.componentInstance.route;
        const urlContext = getUrlContext();
        const modalName = 'stub';

        // Act

        zone.run(() => {
            const modal = service.registerModal(modalName, StubModal)
                .addUrlContext(urlContext);

            service.registerPage(route);

            modal.open({ id: 'id' });
            tick(100);
            modal.close();
            tick(100);
        });
        tick();

        const snapshot = route.snapshot.queryParams;

        service.clear();
        flush();


        // Assert
        expect(snapshot['id']).toBeFalsy();
        expect(snapshot['modal']).toBeFalsy();
    }));

    it('should open two modals, close one modal and leave one opened', fakeAsync(() => {
        // Arrange
        const route = fixture.componentInstance.route;
        const param1 = 'id1';
        const param2 = 'id2';
        const urlContext1 = getUrlContext(param1);
        const urlContext2 = getUrlContext(param2);
        const modalName1 = 'stub1';
        const modalName2 = 'stub2';

        // Act

        zone.run(() => {
            service.registerModal(modalName1, StubModal)
                .addUrlContext(urlContext1);

            service.registerModal(modalName2, StubModal)
                .addUrlContext(urlContext2);

            service.registerPage(route);
            service.open(modalName1, { id1: 'id1' });
            tick(100);
            service.open(modalName2, { id2: 'id2' });
            tick(100);
            service.close(modalName1);
            tick(100);
        });
        tick();

        const snapshot = route.snapshot.queryParams;

        service.clear();
        flush();


        // Assert
        expect(snapshot['id1']).toBeFalsy();
        expect(snapshot['id2']).toEqual('id2');
        expect(snapshot['modal']).toEqual(modalName2);
    }));

    it('should close modal', () => {
        expect(service).toBeTruthy();
    });
});
