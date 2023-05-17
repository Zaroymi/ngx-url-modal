import { ComputeParamsTo } from './compute-params';
import { UrlParamDeclaration } from '../../models/url-params-declaration';

export type ComputeUrlParams<T> = ComputeParamsTo<T, UrlParamDeclaration, string>;
