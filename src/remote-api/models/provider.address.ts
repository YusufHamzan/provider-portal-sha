import { Address } from "./address";
import { ProviderContactPersonDetails } from "./provider.contactPersonDetails";

export interface ProviderAddress {
    addresses:Array<Address>;
    agentContactPersonDetails:ProviderContactPersonDetails;
    agentWeeklyHolidays:Array<string>;

}