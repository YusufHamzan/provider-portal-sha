import Box from '@material-ui/core/Box';
import { Button } from 'primereact/button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
// import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import DeleteIcon from '@material-ui/icons/Delete';
import MuiAlert from '@material-ui/lab/Alert';
// import Autocomplete from "@material-ui/lab/Autocomplete";
import 'date-fns';
import * as React from 'react';
import { useHistory, useParams } from "react-router-dom";
import { PreAuthService } from '../../remote-api/api/claims-services';


const preAuthService = new PreAuthService();



// const validationSchema = yup.object({
//     name: yup.string("Enter your Name").required("Name is required"),
//     type: yup.string("Choose Agent type").required("Agent Type is required"),
//     contact: yup
//         .string("Enter your Contact Number")
//         .required("Contact number is required")
//         .test('len', 'Must be exactly 10 digit', val => val.length === 10),
//     email: yup
//         .string('Enter your email')
//         .email('Enter a valid email'),
//     natureOfAgent: yup
//         .string("Enter Nature of Agent")
//         .required("Agent Nature is required"),
// });

const useStyles = makeStyles(theme => ({
  input1: {
    width: '50%',
  },
  clientTypeRadioGroup: {
    flexWrap: 'nowrap',
    '& label': {
      flexDirection: 'row',
    },
  },
  formControl: {
    minWidth: 182,
  },
  formControl1: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  inputRoot: {
    '&$disabled': {
      color: 'black',
    },
  },
  disabled: {},
  actionContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    marginRight: '5px',
  },
}));

export default function ClaimsDocumentOPDComponent(props) {

  const docTempalte = {
    documentType: 'Prescription',
    docFormat: '',
    documentName: '',
    documentOriginalName: ''
  };


  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const { memId } = localStorage.getItem('preauthid') ? localStorage.getItem('preauthid') : '';

  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [preAuthDetails, setPreAuthDetails] = React.useState({});

  const [documentList, setDocumentList] = React.useState([
    { ...docTempalte }
  ]);

  const handleClose = () => {
    localStorage.removeItem('preauthid')
    history.push('/claims/claims-preauth?mode=viewList');
    // window.location.reload();
  };

  // const useObservable = (observable, setter) => {
  //     useEffect(() => {
  //         let subscription = observable.subscribe((result) => {
  //             setter(result.content);
  //         });
  //         return () => subscription.unsubscribe();
  //     }, [observable, setter]);
  // };

  const handleInputChangeDocumentType = (e, index) => {
    const { name, value } = e.target;
    const list = [...documentList];
    list[index][name] = value;
    setDocumentList(list);
  };

  const handleRemoveDocumentList = index => {
    const list = [...documentList];
    list.splice(index, 1);
    setDocumentList(list);
  };

  const handleAddDocumentList = () => {
    setDocumentList([
      ...documentList,
      {
        ...docTempalte
      },
    ]);
  };

  const onRequestForReview = () => {
    let preID = localStorage.getItem('preauthid')
    if (id) {
      preID = id
    }
    preAuthService.editPreAuth({}, preID, 'requested').subscribe(res => {
      history.push('/claims/claims-preauth?mode=viewList');
      // window.location.reload();
    });
  }

  const handleAddDoc = (e, index) => {
    let preID = localStorage.getItem('preauthid')
    if (id) {
      preID = id
    }
    const file = e.target['files'][0];

    const reader = new FileReader();

    reader.onload = function () {
      const list = [...documentList];
      list[index]['documentOriginalName'] = file.name;

      setDocumentList(list);

      const formData = new FormData();
      formData.append('docType', list[index]['documentType'])
      formData.append('filePart', file);


      preAuthService.addDoc(preID, formData).subscribe(response => {
        list[index]['documentName'] = response.get('id');
        list[index]['docFormat'] = response.get('docFormat');
        setDocumentList(list);
        setUploadSuccess(true);

        populateStepTwo(id);
      });

    };
    reader.readAsDataURL(file);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleFileUploadMsgClose = (event, reason) => {
    setUploadSuccess(false);
  };

  React.useEffect(() => {
    if (id) {
      populateStepTwo(id);
    }
  }, [id]);

  React.useEffect(() => {
    if (localStorage.getItem('preauthid')) {
      populateStepTwo(localStorage.getItem('preauthid'));
    }
  }, [localStorage.getItem('preauthid')]);

  const populateStepTwo = (id) => {
    preAuthService.getPreAuthById(id).subscribe(res => {
      
      setPreAuthDetails(res)
      if (res.documents && res.documents.length !== 0) {
        setDocumentList(res.documents)

      }
    })

  }

  return (
    <Box elevation='none'>
      <Box p={3} my={2}>
        {documentList.map((x, i) => {
          return (
            <Grid container spacing={3} key={i} style={{ marginBottom: '15px' }}>
              <Snackbar open={uploadSuccess} autoHideDuration={3000} onClose={handleFileUploadMsgClose}>
                <Alert onClose={handleFileUploadMsgClose} severity="success">
                  File uploaded successfully
                </Alert>
              </Snackbar>
              <Grid item xs={4}>
                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label" style={{ marginBottom: '0px' }}>
                    Document type
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="documentType"
                    value={x.documentType}
                    disabled={!!x.documentName}
                    onChange={e => handleInputChangeDocumentType(e, i)}>
                    <MenuItem value='Prescription'>Prescription</MenuItem>
                    <MenuItem value='Bill'>Bill</MenuItem>
                    {/* {identificationTypes.map(ele => {
                                            return <MenuItem value={ele.code}>{ele.name}</MenuItem>
                                        })} */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField id="standard-basic" name="documentName" value={x.documentOriginalName} disabled label="Document name" />
              </Grid>

              <Grid
                item
                xs={2}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}>

                <input
                  className={classes.input}
                  id={'contained-button-file' + i.toString()}
                  single
                  name="document"
                  type="file"
                  disabled={!!x.documentName}
                  onChange={e => handleAddDoc(e, i)}
                  style={{ display: 'none' }}
                />
                <label htmlFor={'contained-button-file' + i.toString()} style={{ width: '50%', marginBottom: 0 }}>
                  <Button variant="contained" color="primary" component="span" style={!!x.documentName ? { backgroundColor: '#C9DEFF' } : {}}>
                    <AddAPhotoIcon />
                  </Button>
                </label>

                {/* </label> */}
              </Grid>

              <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
                {documentList.length !== 1 && (
                  <Button
                    className="mr10 p-button-danger"
                    onClick={() => handleRemoveDocumentList(i)}
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: '5px' }}>
                    <DeleteIcon />
                  </Button>
                )}
                {documentList.length - 1 === i && (
                  <Button variant="contained" color="primary" style={{ marginLeft: '5px' }} onClick={handleAddDocumentList}>
                    <AddIcon />
                  </Button>
                )}
              </Grid>
            </Grid>

          );
        })}
      </Box>

      {/* <hr />
      <Box p={3} my={2}>
        <Grid item xs={12} style={{ display: 'flex', alignItems: 'end' }}>
          <Button
                    className="mr10"
                    variant="contained"
                    color="primary"
                    onClick={onRequestForReview}
                    disabled={!preAuthDetails.preAuthStatus || (preAuthDetails.preAuthStatus == 'DRAFT' && preAuthDetails?.subStatus != "DOCUMENT UPLOADED")}
                    >
                      Request
                  </Button>
        </Grid>
      </Box> */}
    </Box>


  );
}
