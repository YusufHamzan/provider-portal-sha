
import { ProviderAddress } from "./provider.address";
import { ProviderBasicDetails } from "./provider.basic";
import { ProviderOtherDetails } from "./provider.otherDetails";

export interface Provider {  
    id?: string;
    providerBasicDetails: ProviderBasicDetails;
    providerAddresses: ProviderAddress;
    ProviderOtherDetails:ProviderOtherDetails
}