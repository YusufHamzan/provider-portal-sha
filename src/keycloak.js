import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://shaidentity.eo2cloud.com',
  // url: "https://identity.eoxegen.com/",
  // url: "https://identity.sha.go.ke",
  realm: "eo2v2",
  clientId: "eo2v2-provider-web-client",
});

export default keycloak;