import { Params } from "@angular/router";
import { UrlModalsQueryParser } from "./url-modal-query-parser";
import { UrlContext } from "./url-context";
import { UrlModal } from "./url-modal";
import { BaseModal } from "./base-modal";
import { stubDialog } from "./url-modal.spec";

describe('UrlModalQueryParser', () => {

    class StubComponent extends BaseModal<any> {
    }

    const modalQuery = 'modal';

    function createModal(
        paramName: string,
        paramValue: string
    ) {
        const urlContext = new UrlContext()
            .declareParam(paramName)
            .addParam(paramName, paramValue);
        const modal = new UrlModal(StubComponent, stubDialog())
            .addUrlContext(urlContext);
        return modal;
    }

    function getModals(
        modalsEntries: Array<{ name: string, params: [string, string] }>
    ) {
        return new Map<string, UrlModal>(
            modalsEntries.map(({ name, params }) => [name, createModal(params[0], params[1])])
        );
    }

    function createParams(modals: Map<string, UrlModal>, opened?: string[]) {
        const openedModals = opened ? opened : Array.from(modals.keys());
        const openedModalsParam = openedModals.length > 1 ? openedModals : openedModals[0];
        const params: Params = {
            [modalQuery]: openedModalsParam
        };

        for (const modalName of openedModals) {
            const modal = modals.get(modalName);
            if (!modal) {
                continue;
            }

            const modalParams = modal.urlContext?.urlParams;
            for (const [paramName, paramValue] of Object.entries(modalParams ?? {})) {
                params[paramName] = paramValue;
            }
            modal.open({});
        }

        return params;
    }

    describe('Correct calculate close params', () => {
        it('should calculate close correctly with different modals params', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p2', 'v2'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal1';

            const currentParams = createParams(modals);
            const expectedParams = {
                [modalQuery]: 'modal2',
                p2: 'v2',
                p1: undefined,
            };

            // Act
            const params = parser.createModalCloseParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(expectedParams);
        });

        it('should calculate close correctly with equal modals params', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p1', 'v1'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal1';

            const currentParams = createParams(modals);
            const expectedParams = {
                [modalQuery]: 'modal2',
                p1: 'v1'
            };

            // Act
            const params = parser.createModalCloseParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(expectedParams);
        });

        it('should not calculate close when modal not exists ', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p1', 'v1'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal3';

            const currentParams = createParams(modals);

            // Act
            const params = parser.createModalCloseParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(currentParams);
        });

        it('should not calculate close when modal not provided ', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal2';

            const currentParams = createParams(modals);

            // Act
            const params = parser.createModalCloseParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(currentParams);
        });
    });

    describe('Correct calculate open params', () => {
        it('should calculate open correctly all modals when nothing opened', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p2', 'v2'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);

            const currentParams = createParams(modals, []);
            const expectedParams = createParams(modals)

            // Act
            const firstParams = parser.createModalOpenParams(currentParams, 'modal1');
            const secondParams = parser.createModalOpenParams(firstParams, 'modal2');

            // Assert
            expect(secondParams).toEqual(expectedParams);
        });

        it('should calculate open correctly when 1 modal opened', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p1', 'v1'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal2';

            const currentParams = createParams(modals, ['modal1']);
            const expectedParams = createParams(modals);

            // Act
            const params = parser.createModalOpenParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(expectedParams);
        });

        it('should not calculate open when modal not exists ', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p1', 'v1'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal3';

            const currentParams = createParams(modals);

            // Act
            const params = parser.createModalOpenParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(currentParams);
        });

        it('should not calculate open when modal was opened ', () => {
            // Arrange
            const modals = getModals([
                { name: 'modal1', params: ['p1', 'v1'] },
                { name: 'modal2', params: ['p1', 'v1'] }
            ]);
            const parser = new UrlModalsQueryParser(modalQuery, modals);
            const modalName = 'modal1';

            const currentParams = createParams(modals);

            // Act
            const params = parser.createModalOpenParams(currentParams, modalName);

            // Assert
            expect(params).toEqual(currentParams);
        });
    });

});
