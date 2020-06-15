const samlify = require('samlify')
const fs = require('fs')
const validator = require('@authenio/samlify-node-xmllint')

const binding = samlify.Constants.namespace.binding;
samlify.setSchemaValidator(validator);

const oktaIdpEnc = samlify.IdentityProvider({
  metadata: fs.readFileSync(__dirname + '/metadata/nemid.xml'),
  isAssertionEncrypted: true,
  messageSigningOrder: 'encrypt-then-sign',
  wantLogoutRequestSigned: true,
});

const spEnc = samlify.ServiceProvider({
  entityID: 'https://kombit.codespace.dk/sp/metadata',
  authnRequestsSigned: true,
  wantAssertionsSigned: true,
  wantMessageSigned: true,
  wantLogoutResponseSigned: true,
  wantLogoutRequestSigned: true,
  privateKey: fs.readFileSync(__dirname + '/key/sign/privkey.pem'),
  encryptCert: fs.readFileSync(__dirname + '/key/sign/cert.cer'),
  signingCert: fs.readFileSync(__dirname + '/key/sign/cert.cer'),
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