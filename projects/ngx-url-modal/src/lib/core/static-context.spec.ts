import { StaticContext } from "./static-context";

describe('StaticContext', () => {
    it('should calculate params', () => {
        // Arrange
        const idExists = 'Exists';
        const idNotExists = 'NotExists';
        const baseConfig = { param: 1, header: (param: { id?: string }) => param.id ? idExists : idNotExists };

        // Act
        const context = new StaticContext(baseConfig);
        const computedWithId = context.computeParams({id: 1});
        const computedWithoutId = context.computeParams({});

        // Assert
        expect(computedWithId).toEqual({...baseConfig, header: idExists, data: {id: 1}});
        expect(computedWithoutId).toEqual({...baseConfig, header: idNotExists, data: {}});
    });
});
