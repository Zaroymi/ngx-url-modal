export type UrlModalEventType = 'close' | 'open';
export interface UrlModalEvent<T = unknown> {
    type: UrlModalEventType;
    data?: T;
}
