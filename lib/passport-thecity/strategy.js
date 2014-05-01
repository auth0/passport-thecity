/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The The City authentication strategy authenticates requests by delegating to
 * The City, using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your The City application's Client ID
 *   - `clientSecret`  your The City application's Client Secret
 *   - `callbackURL`   URL to which The City will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     (https://api.onthecity.org/docs/auth#scopes)
 *   — `userAgent`     All API requests MUST include a valid User Agent string. 
 *                     e.g: domain name of your application.
 *                     (see http://wiki.dev.renren.com/wiki/Authentication for more info)
 *
 * Examples:
 *
 *     passport.use(new TheCityStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/renren/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://authentication.onthecity.org/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://authentication.onthecity.org/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};
  
  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-thecity';
  }
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'thecity';
  this._userProfileURL = options.userProfileURL || 'https://authentication.onthecity.org/authorization';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from The City.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `renren`
 *   - `uid`              the user's Renren ID
 *   - `displayName`      the user's full name
 *   - `name`             the user's name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  var self = this;

  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('Failed to fetch user profile - Step 1', err)); }
      try {
        var json = JSON.parse(body);

        var profile = { provider: 'thecity' };
        // profile.id = json.response.id;
        // profile.displayName = json.response.name;
        // profile.name = json.response.name;
        
        profile._json = json.response;
        profile._raw = body;
        
        done(null, profile);
      } catch(e) {
        done(e);
      }
    });
  });
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;