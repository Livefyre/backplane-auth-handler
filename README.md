backplane-auth-plugin
======================

Livefyre.requireable backplane auth handler

### Example

The backplane authentication handler will handle Backplane login and logout events, but it does not provide a fully functional auth delegate.

```
Livefyre.require(['auth', 'backplane-auth-plugin#0', 'auth-contrib#0.0.0-pre'], function(auth, bpPluginFactory, authContrib) {

                var bpPlugin = bpPluginFactory('livefyre.com');
                bpPlugin(auth); // or auth.plugin(bpPlugin);

                // make a delegate
                var authDelegate = {};

                /**
                 * Login function
                 * In this case, opens a login modal and triggers Backplane to start listening
                 * for login messages
                 */
                authDelegate.login = function(callback) {
                    CAPTURE.startModalLogin();
                    window.Backplane.expectMessages('identity/login');
                    callback();
                };

                /**
                 * Logout function
                 * In this case, invalidates the session and removes the cookie.
                 * Also reloads the page to change state. In order to do this without a reload,
                 * it would be necessary to also update the UI.
                 */
                authDelegate.logout = function(callback) {
                    CAPTURE.invalidateSession();
                    CAPTURE.util.delCookie('backplane-channel');
                    callback();
                };

                /**
                 * View profile function
                 * Arguments are delegate parameter and an author parameter
                 * Used any time a view profile event is triggered
                 */
                authDelegate.viewProfile = function(delegate, author) {
                    console.log(author);
                };

                /**
                 * Edit profile function
                 * Arguments are delegate parameter and an author parameter
                 * Used any time an edit profile event is triggered
                 */
                authDelegate.editProfile = function(delegate, author) {
                    console.log(author);
                };

                auth.delegate(authDelegate);

                window.Auth = auth;
                window.AuthButton = new AuthButton(auth, document.getElementById('login'));
                window.AuthLog = new AuthLog(auth, document.getElementById('log'));
});
```
