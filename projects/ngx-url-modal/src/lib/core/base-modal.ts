import { DialogConfig } from '../models/dialog-provider';

/**
 * BaseModal implements some helpful methods
 */
export abstract class BaseModal<ConfigType> {

        constructor(
            public readonly configData?: ConfigType
        ) {}

}
