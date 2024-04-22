export interface PageRequest {
	page: number;
	size: number;
	summary: boolean;
	active?: boolean;
	sort?: Array<any>;
}

export const defaultPageRequest: PageRequest = {
	page: 0,
	size: 10,
	summary: true,
	active: true,
};

export interface PageRequestServicegrouping {
    page: number;
    size: number;
    summary: boolean;
    active?: boolean;
    sort?: Array<any>;
    nonGroupedServiceGroup?: boolean;
    groupedServiceServiceGroup?: boolean;
    parentEligibleServiceGroupIrrespectiveGruping?: boolean;
    groupCode?: string;
    groupName?: string;
}

export const defaultPageRequestServiceGrouping: PageRequestServicegrouping = {
    page: 0,
    size: 10,
    summary: true,
    active: true,
    nonGroupedServiceGroup: true
};

export interface PageRequestServices {
    page: number;
    size: number;
    summary: boolean;
    active?: boolean;
    sort?: Array<any>;
    nonGroupedServices?: boolean;
    nameAlias?: string;
    icdCode?: string;
    name?: string;
}

export const defaultPageRequestServices: PageRequestServices = {
    page: 0,
    size: 10,
    summary: true,
    active: true,
    nonGroupedServices: false
};

export const defaultPageRequestServices1: PageRequestServices = {
    page: 0,
    size: 10,
    summary: true,
    active: true,
    nonGroupedServices: true
};