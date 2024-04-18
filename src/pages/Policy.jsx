import React from 'react';
import { ClientService } from '../remote-api/api/client-services/client.services';
import { defaultPageRequest } from '../remote-api/query-params/page-request';
import { Eo2v2DataGrid } from '../components/eo2v2.data.grid';
import { MemberService } from '../remote-api/api/member-services';
import { ClaimService } from '../remote-api/api/claim-services';
import { map, switchMap } from 'rxjs/operators';
import { toDate } from '../utils/dates';
import { useNavigate } from 'react-router-dom';


const clientservice = new ClientService()
const memberservice = new MemberService()
const claimservice = new ClaimService()

const Policy = () => {
  const user_detail = JSON.parse(localStorage.getItem('user_details'))
  console.log('user_detail', user_detail.preferred_username)
  const mobile_no = user_detail.preferred_username
  const navigate = useNavigate();


  const onPolicyClick = rowData => {
    console.log(rowData)
    navigate(`/policy/${rowData.policyNumber}`);
  };

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    },
  ) => {
    // pageRequest.sort = ['rowLastUpdatedDate dsc'];
    if (pageRequest.searchKey) {
      pageRequest['code'] = pageRequest.searchKey;
      pageRequest['type'] = pageRequest.searchKey;
      pageRequest['name'] = pageRequest.searchKey;
    }
    delete pageRequest.searchKey;

    return clientservice.getClientsByMobile(defaultPageRequest, mobile_no).pipe(
      map(data => data),
    ).pipe(
      switchMap(data => {
        return claimservice.getAllPolicies(pageRequest, data.id).pipe(
          map(response => ({
            ...response,
            content: response.content.map(item => ({
              ...item,
              policyPeriod: `${toDate(item.policyStartDate)} - ${toDate(item.policyEndDate)}`,
            })),
          })),
        );
      }));
  };


  const columnsDefinations = [
    { field: 'clientName', headerName: 'Proposer Name' },
    {
      field: 'policyNumber', headerName: 'Policy No', body: (rowData) => (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blueviolet' }}
          title={rowData?.policyNumber}
          onClick={() => onPolicyClick(rowData)}
        >
          {rowData?.policyNumber}
        </span>
      ),
    },
    { field: 'policyPeriod', headerName: 'Policy Period' },
    { field: 'policyStatus', headerName: 'Policy Status' },
  ];

  const configuration = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: false,
    header: {
      enable: true,
      text: 'Policy Management',
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

export default Policy;