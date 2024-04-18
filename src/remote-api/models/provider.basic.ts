export interface ProviderBasicDetails {
        name: "";
        type: "";
        taxPinNumber: "";
        code: "";
        abbreviation: "";
        parentProviderId: "";
        partnerId: "";
        orgTypeCd: "";
        contactNos: [
          {
            id?: 0,
            contactNo: "",
            contactType: ""
          }
        ];
        emails: [
          {
            id?: 0,
            emailId: "",
            contactType: ""
          }
        ];
        identifications: [
          {
            id?: 0,
            identificationType: "",
            identificationNo: "",
            docFormat: "",
            document: ""
          }
        ];
        specializations: [
          {
            id?: 0,
            code: "",
            name: ""
          }
        ]
}