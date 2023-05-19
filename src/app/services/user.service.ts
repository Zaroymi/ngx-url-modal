import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    public users: User[] = [
        { id: '1', name: 'Stephan'},
        { id: '2', name: 'Robert'},
        { id: '3', name: 'George'},
    ];

    constructor() { }

    public getUserById(id: string) {
        return this.users.find(user => user.id === id);
    }
}
