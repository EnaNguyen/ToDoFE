import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
export interface UserProfile{
    userId: number;
    fullName: string;
    username: string;
    role: string;
}
@Injectable({
    providedIn: 'root',
})
export class AuthServices {
    private currentUser = new BehaviorSubject<UserProfile | null>(this.loadUserFromStorage());
    public currentUser$ = this.currentUser.asObservable();

    private loadUserFromStorage(): UserProfile | null {
        if (typeof window !== 'undefined' && window.localStorage) {
            const userData = window.localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    setUser(user: UserProfile) {
        this.currentUser.next(user);
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('userData', JSON.stringify(user));
        }
    }
    isLogginedIn(): boolean {
        return this.currentUser.value !== null;
    }
    getUserRole(): string | null {
        return this.currentUser.value ? this.currentUser.value.role : null;
    }
    logout() {
        this.currentUser.next(null);
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('userData');
        }
    }
}