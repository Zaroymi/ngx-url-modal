import { UrlContext } from "./url-context";

describe('UrlParamsContext', () => {
    it('should declare and add default params', () => {
        // Arrage
        const context = new UrlContext();
        const [value1, value2] = ['value1', 'value2']

        // Act
        const updatedContext = context
            .declareParam('param1')
            .declareParam('param2')
            .addParam('param1', value1)
            .addParam('param2', value2);
        const params = updatedContext.urlParams;

        // Assert
        expect(params.param1).toEqual(value1);
        expect(params.param2).toEqual(value2);
    });

    it('should correct compute params', () => {
        // Arrage
        const objWithIdToFind = { id: '2' };
        const idToFind = objWithIdToFind.id;
        const ids = [{ id: '1' }, objWithIdToFind];

        // Act
        const context = new UrlContext()
            .declareParam('id')
            .declareComputedParam('findedId', params => {
                expect().nothing();
                return ids.find(({id}) => params.id === id);
            })
            .addParam('id', idToFind);

        const params = context.computeParams();

        // Assert
        expect(params?.id).toEqual(idToFind);
        expect(params?.findedId).toEqual(objWithIdToFind);

    });

    it('should return undefined after computing without params adding', () => {
        // Arrage
        const objWithIdToFind = { id: '2' };
        const idToFind = objWithIdToFind.id;
        const ids = [{ id: '1' }, objWithIdToFind];

        // Act
        const context = new UrlContext()
            .declareParam('id', false)
            .declareComputedParam('findedId', params => {
                return ids.find(({id}) => params.id === id);
            });

        const params = context.computeParams();

        // Assert
        expect(params).toBeFalsy();
        expect(context.readyToExecute).toBeFalse();

    });

    it('should correct return url params', () => {
        // Arrage
        const context = new UrlContext()
            .declareParam('id')
            .declareComputedParam('findedId', params => {
                return [];
            })
            .addParam('id', 'value');

        // Act
        const urlParams = context.urlParams;

        // Assert
        expect(urlParams.id).toEqual('value');
        expect(urlParams.findedId).toBeFalsy();

    });

    it('should add only declared params', () => {
        // Arrage
        const context = new UrlContext()
            .declareParam('id')
            .declareParam('id2');

        const allParams = {
            id: '1',
            id2: '2',
            id3: '3'
        };

        // Act
        const urlParams = context.addParams(allParams).urlParams;

        // Assert
        expect(urlParams.id).toBeTruthy();
        expect(urlParams.id2).toBeTruthy();
        expect((urlParams as any).id3).toBeFalsy();

    });
})
