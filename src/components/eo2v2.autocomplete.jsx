import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createTheme, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useEffect } from 'react';

const useStyles = makeStyles(theme => ({}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

let searchId = '';

export function EO2V2Autocomplete(props) {
  const classes = useStyles();
  const [options, setOptions] = React.useState({});
  const [defaultOptions, setDefaultOptions] = React.useState({});
  const [value, setValue] = React.useState(props.multiple ? [] : '');
  const [currentPage, setCurrentPage] = React.useState(0);
  const [searchText, setSearchText] = React.useState('');
  const [displayKey, setdisplayKey] = React.useState('name');
  const loading = false;

  useEffect(() => {
    if (props.txtValue) {
      if (props.displayKey) {
        let obj = props.displayKey.split('.'); // {a:{b:{c:{}}}
        obj.reverse();

        const nestedObject = obj.reduce(
          (prev, current) => ({ [current]: (typeof prev == 'string' && prev) || { ...prev } }),
          props.txtValue,
        );
        setValue({ ...nestedObject });
      } else {
        setValue({ name: props.txtValue });
      }
    }
  }, [props.txtValue]);

  useEffect(() => {
    if (props.changeDetect) {
      props.$dataSource().subscribe(resp => {
        setOptions({ values: resp.content, totalCount: resp.totalElements });
        setDefaultOptions({ values: resp.content, totalCount: resp.totalElements });
        if (!props.txtValue) {
          changeValue({ values: resp.content, totalCount: resp.totalElements });
        }
      });
    }
  }, [props.changeDetect]);
  useEffect(() => {
    if (!props.txtValue) {
      searchId = props.value;
      changeValue();
    }
  }, [props.value]);

  const getDisplayValue = option => {
    if (props.displayKey && option) {
      return props.displayKey.split('.').reduce((a, prop) => a[prop], option);
    }
    return option.name || '';
  };

  const changeValue = list => {
    if (!list) {
      list = options;
    }
    if (JSON.stringify(searchId) != JSON.stringify(value) && list.values?.length > 0) {
      const valueObject = getValueById(searchId, list);
      setValue(valueObject);
    }
  };

  const loadMore = () => {
    if (options.values.length < options.totalCount) {
      setCurrentPage(currentPage + 1);

      props.$dataSource({ page: currentPage + 1 }, { type: 'load', searchText }).subscribe(resp => {
        setOptions({ ...options, values: [...options.values, ...resp.content] });

        if (!searchText) {
          setDefaultOptions({ ...options, values: [...options.values, ...resp.content] });
        }
      });
    }
  };

  const searchData = searchText => {
    setSearchText(searchText);
    setCurrentPage(0);

    props.$dataSource({ page: 0 }, { type: 'search', searchText }).subscribe(resp => {
      setOptions({ values: resp.content, totalCount: resp.totalElements });
    });
  };

  const handleChange = (e, newValue) => {
    setValue(newValue || '');
    props.onChange(e, newValue);
  };

  const onClose = () => {
    // if (!value) {
    setOptions(defaultOptions);
    setCurrentPage(0);
    setSearchText('');
    // }
  };

  const autocompleteFilterChange = (options, state) => {
    return [...options];
  };

  const getValueById = (value, list) => {
    if (list.values && list.values.length > 0 && value) {
      if (!props.multiple) {
        return list.values.find(opt => opt.id === value.id);
      } else {
        if (value.length > 0) {
          return list.values.filter(opt => value.indexOf(opt.id) > -1);
        } else {
          return [];
        }
      }
    } else {
      let obj = { id: '' };
      if (props.multiple) return [];
      if (props.displayKey) {
        const keys = props.displayKey.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
        lastObj[lastKey] = '';
      } else {
        obj.name = '';
      }
      return obj;
    }
  };

  return (
    <Autocomplete
      ListboxProps={{
        onScroll: event => {
          const listboxNode = event.currentTarget;
          if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
            loadMore();
          }
        },
      }}
      multiple={props.multiple || false}
      id={props.id}
      name={props.name}
      value={value}
      onChange={handleChange}
      onClose={onClose}
      loading={loading}
      options={options.values ?? []}
      getOptionLabel={option => getDisplayValue(option)}
      filterOptions={autocompleteFilterChange}
      getOptionSelected={(option, value) => option.id === value?.id}
      renderOption={(option, { selected }) => {
        if (props.multiple) {
          const allSelected = false;
          const selectedOpt = (option.id === 'selectall' && allSelected) || selected;
          return (
            <div style={{ fontSize: '12px' }}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8, color: '#3a7cff' }}
                checked={selectedOpt}
              />
              {getDisplayValue(option)}
            </div>
          );
        } else {
          return <div style={{ fontSize: '12px' }}>{getDisplayValue(option)}</div>;
        }
      }}
      disabled={props.disabled}
      renderInput={params => (
        <TextField
          {...params}
          error={props.error}
          helperText={props.helperText}
          required={props.required}
          onChange={ev => {
            // dont fire API if the user delete or not entered anything
            if ((ev.target.value !== '' || ev.target.value !== null) && ev.target.value.length > 2) {
              searchData(ev.target.value);
            }
          }}
          label={props.label}
            ref={props.ref}

          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
