import React from 'react';
import { Eo2v2DataGrid } from '../components/eo2v2.data.grid';
import { ProvidersService } from '../remote-api/eo2v2-remote-api';
import { ProviderTypeService } from '../remote-api/api/master-services/provider.type.service';
import { map, switchMap } from 'rxjs/operators';


const providerService = new ProvidersService();
const providertypeservice = new ProviderTypeService();

const Providers = () => {

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    },
  ) => {
    pageRequest.sort = ['rowLastUpdatedDate dsc'];
    if (pageRequest.searchKey) {
      pageRequest['code'] = pageRequest.searchKey;
      pageRequest['type'] = pageRequest.searchKey;
      pageRequest['name'] = pageRequest.searchKey;
    }
    delete pageRequest.searchKey;

    return providerService.getProviders(pageRequest).pipe(
      map(data => {
        let content = data.content;
        // setData(content)
        let records = content.map(item => {
          item['providerBasicDetails']['primaryContact'] = item.providerBasicDetails.contactNos[0].contactNo;
          item['blacklist'] = item.blackListed ? 'Yes' : 'No';
          item['category'] = item?.providerCategoryHistorys[0]?.categoryId;
          return item;
        });
        data.content = records;
        return data;
      }),
    ).pipe(
      switchMap(data => {
        return providertypeservice.getProviderTypes().pipe(
          map(pt => {
            data.content.forEach(pr => {
              pt.content.forEach(providertype => {
                if (pr.providerBasicDetails.type === providertype.code) {
                  pr['providerTypeName'] = providertype.name
                }
              })
            })
            return data;
          }))
      }));;
  };

  const columnsDefinations = [
    { field: 'providerBasicDetails.name', headerName: 'Provider Name' },
    { field: 'providerBasicDetails.code', headerName: 'Provider Code' },
    { field: 'providerTypeName', headerName: 'Provider Type' },
    { field: 'providerBasicDetails.primaryContact', headerName: 'Contact Number' },
    {
      field: 'category', headerName: 'Category', body: (rowData) => (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
          title={rowData.id}
        // onClick={(e) => onCategoryClick(e)}
        >
          {rowData.category}
        </span>
      ),
    },
    { field: 'blacklist', headerName: 'Blacklisted' },
  ];

  const configuration = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: true,
    header: {
      enable: true,
      text: 'Provider Management',
      enableGlobalSearch: true,
      searchText: 'Search by code,name,type',
    },
  };

  return (
    <Eo2v2DataGrid
      $dataSource={dataSource$}
      config={configuration}
      columnsDefination={columnsDefinations}
    />
  );
};

export default Providers;