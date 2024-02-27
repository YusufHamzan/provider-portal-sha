import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
    url: 'https://identity.eoxegen.com/auth/',
    realm: 'eo2v2',
    clientId: 'eo2v2-web-client',
});