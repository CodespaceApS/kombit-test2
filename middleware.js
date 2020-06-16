const samlify = require('samlify')
const fs = require('fs')
const validator = require('@authenio/samlify-node-xmllint')

const binding = samlify.Constants.namespace.binding;
samlify.setSchemaValidator(validator);

const oktaIdpEnc = samlify.IdentityProvider({
  metadata: fs.readFileSync(__dirname + '/metadata/nemid.xml'),
})

const spEnc = samlify.ServiceProvider({
  entityID: 'https://kombit.codespace.dk/sp/metadata',
  signingCert: fs.readFileSync(__dirname + '/key/cert.pem'),
  encryptCert: fs.readFileSync(__dirname + '/key/cert.pem'),
  singleLogoutService: [{
    Binding: binding.redirect,
    Location: 'https://kombit.codespace.dk/sp/single_logout/redirect',
  }],
  assertionConsumerService: [{
    Binding: binding.post,
    Location: 'https://kombit.codespace.dk/sp/acs',
  }]
});

module.exports.assignEntity = (req, res, next) => {
    req.idp = oktaIdpEnc;
    req.sp = spEnc;
  return next();
};