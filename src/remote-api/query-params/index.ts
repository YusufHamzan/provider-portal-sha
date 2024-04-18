import { PageRequest, defaultPageRequest } from './page-request';

export interface ProviderRequestQueryParam extends PageRequest {
	parentProviderOnly?: boolean;
}
export const ProviderPageRequest: ProviderRequestQueryParam = {
	page: 0,
	size: 100,
	summary: true,
	active: false,
	parentProviderOnly: true,
};

export interface ProspectRequestQueryParam extends PageRequest {
	code?: string;
}
