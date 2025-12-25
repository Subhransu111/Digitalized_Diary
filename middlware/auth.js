const {auth} = require('express-oauth2-jwt-bearer');

// check the token
const checkJwt = auth({
    audience:'https://cyber-diary-api',
    issuerBaseURL:'https://dev-mns1lf8qbfytdl5b.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});

module.exports = checkJwt;