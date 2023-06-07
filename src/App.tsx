import React, {useContext} from 'react';
import { ConfigContext } from './ConfigContext';
import AppFixedSide from "./main/AppFixedSide";
import AppTopSide from "./main/AppTopSide";

function App() {
  const config = useContext(ConfigContext);

  if(config.layout === 'AppTopSide'){
    return (
        <AppTopSide />
    );
  }else if(config.layout === 'AppFixedSide'){
    return (
        <AppFixedSide />
    );
  }else {
   return (
         <div>unknown layout, please set server properties, e.g.: cluo-management.ui.layout=AppTopSide</div>
    );
  }
}

export default App;
