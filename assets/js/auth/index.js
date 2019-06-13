import auth0 from 'auth0-js';

import config from 'Config';

class Auth {

    idToken;

    userProfile;

    tokenRenewalTimer;

    constructor() {
        this.auth0 = new auth0.WebAuth({
            domain: 'hicube.auth0.com',
            clientID: config.getParam('authClientId'),
            redirectUri: `${config.getParam('baseUri')}/auth/callback`,
            responseType: 'token id_token',
            scope: 'openid profile email',
            audience: config.getParam('api').url
        });
    }

    login() {
        if (this.isAuthenticated()) {
            // no need to authorize
            return;
        }
        this.auth0.authorize();
    }

    forceLogin() {
        this.logout();
        this.login();
    }

    handleAuthentication(onSuccess, onErr) {
        this.auth0.parseHash((err, authResult) => {
            this.handleAuthResult(err, authResult, onSuccess, onErr);
        });
    }

    handleAuthResult(err, authResult, onSuccess, onErr) {
        if (authResult && authResult.accessToken && authResult.idToken) {
            this.setSession(authResult);
            onSuccess && onSuccess(authResult);
        } else if (err) {
            onErr && onErr(err);
        }
    }

    renewSession() {
        this.auth0.checkSession({}, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult);
            } else if (err) {
                this.forceLogin();
            }
        });
    }

    scheduleRenewal() {
        // if there is already a renewal scheduled, don't bother
        if (this.tokenRenewalTimer) {
            return;
        }
        let expiresAt = this.getExpiryTime();
        const timeout = expiresAt - Date.now();
        if (timeout > 0) {
            this.tokenRenewalTimer = setTimeout(() => {
                this.renewSession();
                this.tokenRenewalTimer = null;
            }, timeout);
        }
    }

    setSession(authResult) {
        // Set the time that the Access Token will expire at
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('id_token_payload', JSON.stringify(authResult.idTokenPayload));
        localStorage.setItem('expires_at', expiresAt);
        // schedule a token renewal
        this.scheduleRenewal();
    }

    logout() {
        // Clear Access Token and ID Token from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('id_token_payload');
        localStorage.removeItem('expires_at');
        // Clear token renewal
        if (this.tokenRenewalTimer) {
            clearTimeout(this.tokenRenewalTimer);
        }
    }

    getExpiryTime() {
        return new Date(JSON.parse(localStorage.getItem('expires_at')));
    }

    isAuthenticated() {
        // Check whether the current time is past the Access Token's expiry time
        let isAuth = new Date().getTime() < this.getExpiryTime();
        if (isAuth) {
            // let's take this opportunity to make sure we have a renewal scheduled
            this.scheduleRenewal();
        }
        return isAuth;
    }

    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    getIdToken() {
        if (!this.idToken) {
            this.idToken = JSON.parse(localStorage.getItem('id_token_payload'));
        }
        return this.idToken;
    }

    getNSClaim(claim) {
        const ns = 'https://hicube.caida.org/';
        return this.getIdToken()[ns + claim];
    }

    getNickname() {
        return this.getIdToken().nickname;
    }

    getName() {
        return this.getIdToken().name;
    }

    getSubject() {
        return this.getIdToken().sub;
    }

    getAuthorization() {
        return this.getNSClaim('auth');
    }

    getAuthField(field) {
        const auth = this.getNSClaim('auth');
        return (auth && auth[field]) || [];
    }

    hasPermission(permission) {
        return this.getAuthField('permissions').includes(permission);
    }

    hasRole(role) {
        return this.getAuthField('roles').includes(role);
    }

    inGroup(group) {
        return this.getAuthField('groups').includes(group);
    }

    getProfile(cb) {
        if (this.userProfile) {
            cb(this.userProfile);
            return;
        }
        const accessToken = this.getAccessToken();
        this.auth0.client.userInfo(accessToken, (err, profile) => {
            if (profile) {
                this.userProfile = profile;
            }
            cb(profile, err);
        });
    }
}

export const auth = new Auth();
