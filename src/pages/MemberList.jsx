import React from 'react';
import { useParams } from 'react-router-dom';
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

const MemberList = () => {
  const user_detail = JSON.parse(localStorage.getItem('user_details'))
  console.log('user_detail', user_detail.preferred_username)
  const navigate = useNavigate();
  const { policyNumber, membershipNo } = useParams();

  const onPolicyClick = rowData => {
    console.log(rowData)
    navigate(`/policy/${policyNumber}/${encodeURIComponent(rowData.membershipNo)}`);
  };

  const dataSource$ = (
    pageRequest = {
      page: 0,
      size: 10,
      summary: true,
      active: true,
    },
  ) => {
    if (pageRequest.searchKey) {
      pageRequest['code'] = pageRequest.searchKey;
      pageRequest['type'] = pageRequest.searchKey;
      pageRequest['name'] = pageRequest.searchKey;
    }
    delete pageRequest.searchKey;

    return memberservice.getMembersByPolicy(pageRequest, policyNumber).pipe(
      map(data => {
        console.log(data)

        return data
      }

      ),
    )
  };


  const columnsDefinations = [
    { field: 'name', headerName: 'Member Name' },
    {
      field: 'membershipNo', headerName: 'Membership No', body: (rowData) => (
        <span
          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blueviolet' }}
          title={rowData?.membershipNo}
          onClick={() => onPolicyClick(rowData)}
        >
          {rowData?.membershipNo}
        </span>
      ),
    },
    { field: 'mobileNo', headerName: 'Mobile No' },
    { field: 'email', headerName: 'Email' },
  ];

  const configuration = {
    enableSelection: false,
    scrollHeight: '300px',
    pageSize: 10,
    actionButtons: false,
    header: {
      enable: true,
      text: 'Member Management',
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

export default MemberList;