import { TabPanel, TabView } from "primereact/tabview";
import PreAuthIPDListComponent from "../components/preauth-ipd/preauth.list";
import PreAuthOPDListComponent from "../components/preauth-opd/preauth.list";

const Preauth = () => {
  return (
        <PreAuthIPDListComponent />
    // <TabView scrollable style={{ fontSize: "14px" }}>
    //   <TabPanel leftIcon="pi pi-user mr-2" header="Pre-Auth">
    //     <PreAuthIPDListComponent />
    //   </TabPanel>
    //   <TabPanel leftIcon="pi pi-user-minus mr-2" header="OPD Pre-Auth">
    //     <PreAuthOPDListComponent />
    //   </TabPanel> 
    // </TabView>
  );
};
export default Preauth;
