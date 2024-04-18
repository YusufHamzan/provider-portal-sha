import PropTypes from 'prop-types';
import { Observable } from 'rxjs';

const ActionButtonPropTypes = {
  label: PropTypes.string,
  icon: PropTypes.string,
  tooltip: PropTypes.string,
  disabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onClick: PropTypes.func.isRequired,
};

const HeaderPropTypes = {
  text: PropTypes.string.isRequired,
  enable: PropTypes.bool,
  searchText: PropTypes.string,
  enableGlobalSearch: PropTypes.bool,
  selectionMenus: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  ),
  onSelectionChange: PropTypes.func,
  selectionMenuButtonText: PropTypes.string,
  onCreateButtonClick: PropTypes.func,
  addCreateButton: PropTypes.bool,
  createButtonText: PropTypes.string,
  createButtonIcon: PropTypes.string,
};

const Eo2v2DataGridPropTypes = {
  config: PropTypes.shape({
    actionButtons: PropTypes.arrayOf(ActionButtonPropTypes),
    pageSize: PropTypes.number.isRequired,
    enableSelection: PropTypes.bool,
    header: HeaderPropTypes,
  }).isRequired,
  $dataSource: PropTypes.oneOfType([PropTypes.instanceOf(Observable), PropTypes.func]).isRequired,
  columnsDefination: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      body: PropTypes.func,
      style: PropTypes.object,
      headerStyle: PropTypes.object,
      bodyStyle: PropTypes.object,
      editor: PropTypes.func,
    }),
  ),
  selectedId: PropTypes.string,
  reloadTable: PropTypes.bool,
  isCopy: PropTypes.bool,
  width: PropTypes.string,
};

export default Eo2v2DataGridPropTypes;
