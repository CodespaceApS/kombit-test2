const express = require('express')
const bodyParser = require('body-parser')
const { assignEntity } = require('./middleware')
const app = express()
const port = 8080

app.use(bodyParser.urlencoded({ extended: false }))
app.set('json spaces', 2)
app.use(assignEntity)

app.get('/', (req, res) => res.send('Hello World!'))


app.get('/sp/metadata', (req, res) => {
  res.header('Content-Type', 'text/xml').send(req.sp.getMetadata());
});

app.get('/idp/metadata', (req, res) => {
  res.header('Content-Type', 'text/xml').send(req.idp.getMetadata());
});

 // assertion consumer service endpoint (post-binding)
 app.post('/sp/acs', async (req, res) => {
  return res.send('Error');
  try {
    const { extract } = await req.sp.parseLoginResponse(req.idp, 'post', req);
    const { login } = extract.attributes;
    // get your system user
    const payload = getUser(login);

    // assign req user
    req.user = { nameId: login };

    if (payload) {
      // create session and redirect to the session page
      const token = createToken(payload);
      return res.redirect(`/?auth_token=${token}`);
    }
    throw new Error('ERR_USER_NOT_FOUND');
  } catch (e) {
    console.log('[FATAL] when parsing login response sent from okta', e);
    return res.send('Error');
  }
});

// call to init a sso login with redirect binding
app.get('/sso/redirect', async (req, res) => {
  const { id, context: redirectUrl } = await req.sp.createLoginRequest(req.idp, 'redirect');
  return res.redirect(redirectUrl);
});

// endpoint where consuming logout response
app.post('/sp/sso/logout', async (req, res) => {
  const { extract } = await req.sp.parseLogoutResponse(req.idp, 'post', req);
  return res.redirect('/logout');
});

app.get('/sp/single_logout/redirect', async (req, res) => {
  const { context: redirectUrl } = await req.sp.createLogoutRequest(req.idp, 'redirect', { logoutNameID: 'user.passify.io@gmail.com' });
  return res.redirect(redirectUrl);
});

// distribute the metadata
app.get('/sp/metadata', (req, res) => {
  res.header('Content-Type', 'text/xml').send(req.sp.getMetadata());
});

app.get('/idp/metadata', (req, res) => {
  res.header('Content-Type', 'text/xml').send(req.idp.getMetadata());
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))