import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: "https://identity.eoxegen.com/auth/",
  realm: "eo2v2",
  clientId: "eo2v2-web-client",
});

export default keycloak;