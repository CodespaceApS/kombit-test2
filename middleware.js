const samlify = require('samlify')
const fs = require('fs')
const validator = require('@authenio/samlify-node-xmllint')

const binding = samlify.Constants.namespace.binding;
samlify.setSchemaValidator(validator);

const oktaIdp = samlify.IdentityProvider({
  metadata: fs.readFileSync(__dirname + '/metadata/nemid.xml'),
  wantLogoutRequestSigned: true
});

const oktaIdpEnc = samlify.IdentityProvider({
  metadata: fs.readFileSync(__dirname + '/metadata/nemid.xml'),
  isAssertionEncrypted: true,
  messageSigningOrder: 'encrypt-then-sign',
  wantLogoutRequestSigned: true,
});

const sp = samlify.ServiceProvider({
  entityID: 'https://kombit.codespace.dk/metadata',
  authnRequestsSigned: false,
  wantAssertionsSigned: true,
  wantMessageSigned: true,
  wantLogoutResponseSigned: true,
  wantLogoutRequestSigned: true,
  privateKey: fs.readFileSync(__dirname + '/key/sign/privkey.pem'),
  privateKeyPass: 'VHOSp5RUiBcrsjrcAuXFwU1NKCkGA8px',
  isAssertionEncrypted: false,
  assertionConsumerService: [{
    Binding: binding.post,
    Location: 'https://kombit.codespace.dk/sp/acs',
  }]
});

const spEnc = samlify.ServiceProvider({
  entityID: 'https://kombit.codespace.dk/metadata?encrypted=true',
  authnRequestsSigned: true,
  wantAssertionsSigned: true,
  wantMessageSigned: true,
  wantLogoutResponseSigned: true,
  wantLogoutRequestSigned: true,
  encryptCert: fs.readFileSync(__dirname + '/key/sign/cert.cer'),
  signingCert: fs.readFileSync(__dirname + '/key/sign/cert.cer'),
  privateKey: fs.readFileSync(__dirname + '/key/sign/privkey.pem'),
  privateKeyPass: 'VHOSp5RUiBcrsjrcAuXFwU1NKCkGA8px',
  encPrivateKey: fs.readFileSync(__dirname + '/key/encrypt/privkey.pem'),
  assertionConsumerService: [{
    Binding: binding.post,
    Location: 'https://kombit.codespace.dk/sp/acs?encrypted=true',
  }]
});

module.exports.assignEntity = (req, res, next) => {
  req.idp = oktaIdp;
  req.sp = sp;
  if (true) {
    req.idp = oktaIdpEnc;
    req.sp = spEnc;
  }
  return next();
};