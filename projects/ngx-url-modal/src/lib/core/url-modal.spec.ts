import { Subject } from 'rxjs';
import { UrlModal } from "./url-modal";
import { DialogProvider, DialogRef } from "../models/dialog-provider";
import { UrlContext } from './url-context';
import { BaseModal } from './base-modal';

export const stubDialog: () => DialogProvider = () => ({
    open: (component, config) => {
        const onClose = new Subject<any>();
        return {
            onClose: onClose.asObservable(),
            destroy: jasmine.createSpy('destroy', () => { }),
            close: (data) => {
                onClose.next(data);
            },
        };
    },

});


describe('UrlModal', () => {

    class StubModal extends BaseModal<{ id: string, user: { id: string } }> {
    }

    const stubUrlContext = new UrlContext()
        .declareParam('id')
        .addParam('id', '');

    it('should open', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());
        modal.addUrlContext(stubUrlContext);

        // Act
        modal.open({});

        // Assert
        expect(modal.isOpened).toBeTrue();
    });

    it('should close', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());

        // Act
        modal.close();

        // Assert
        expect(modal.isOpened).toBeFalse();
    });

    it('should add url context', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());

        // Act
        const context = new UrlContext()
            .declareParam('id')
            .declareComputedParam('user', param => {
                return { id: param.id };
            });

        modal.addUrlContext(context);

        // Assert
        // Just for type cheking
        expect().nothing();
    });

    it('should add static context', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());
        const config = {
            some: '12',
            data: {
                id: '',
                anotherSomething: 1,
                user: { id: '1' }
            }
        };

        // Act
        modal.addStaticContext(config);

        // Assert
        // Just checking typings
        expect().nothing();
    });

    it('should clear ', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());
        modal.addUrlContext(stubUrlContext);

        // Act
        modal.open({});
        const ref = (modal as any).ref as DialogRef<any>;
        modal.clear();

        // Assert
        expect(ref.destroy).toHaveBeenCalled();
        expect(modal.isOpened).toBeFalse();
        expect((modal as any).ref).toBeFalsy();
    });

    it('should sent events', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());
        modal.addUrlContext(stubUrlContext);

        const onOpen = jasmine.createSpy('onOpen', () => { });
        let expectedValue: string;
        const closedValue = '12312';
        const onClose = jasmine.createSpy('onClose').and.callFake((data) => {
            expectedValue = data
        });

        // Act
        modal.on('open', onOpen);
        modal.on('close', onClose);

        modal.open({});
        modal.close(closedValue);

        // Assert
        expect(onOpen).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        expect(expectedValue!).toEqual(closedValue);
    });

    it('should not open without url  all params', () => {
        // Arrange
        const modal = new UrlModal(StubModal, stubDialog());

        // Act
        const context = new UrlContext().declareParam('id', false);
        modal.addUrlContext(context);
        modal.open({});
        const isOnpenedWhenNoParams = modal.isOpened;

        // Assert
        expect(isOnpenedWhenNoParams).toBeFalse();
    });

});
