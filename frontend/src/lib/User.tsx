import {Token} from './API/APIUser';

export default class User {
    static signIn(userID: string, token: Token) {
        localStorage.setItem('signedIn', 'true');
        localStorage.setItem('userID', userID);
        localStorage.setItem('userPrivilegeTitle', token.PrivilegeTitle);
        localStorage.setItem('authToken', token.token);
        window.location.href = '/';
    }

    static signOut() {
        localStorage.setItem('signedIn', 'false');
        localStorage.setItem('userID', '');
        localStorage.setItem('userPrivilegeTitle', '');
        localStorage.setItem('authToken', '');
        this.setDeveloperModeOff();
        window.location.href = '/signin';
    }

    static getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    static isSignedIn(): boolean {
        //Auto sign out if idle for longer than maxIdleSeconds.
        let maxIdleSeconds = 3600;
        let currentTime = Math.floor(new Date().getTime() / 1000);
        let lastActivity = localStorage.getItem('lastActivity');
        localStorage.setItem('lastActivity', currentTime.toString());
        if (lastActivity !== undefined &&
            lastActivity !== null &&
            (parseInt(lastActivity) + maxIdleSeconds < currentTime)) {
            this.signOut();
            return false;
        }

        return localStorage.getItem('signedIn') === 'true';
    }

    static setDeveloperModeOn(): void {
        localStorage.setItem('developerMode', 'true');
    }

    static setDeveloperModeOff(): void {
        localStorage.setItem('developerMode', 'false');
    }

    static isDeveloper(): boolean {
        return localStorage.getItem('developerMode') === 'true';
    }

    static getUserID(): string | null {
        return localStorage.getItem('userID');
    }

    static getPrivilegeTitle(): string | null {
        return localStorage.getItem('userPrivilegeTitle');
    }
}