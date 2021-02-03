import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { reducer as formReducer } from 'redux-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';


class Harness extends React.Component {
 render() {
   const prefixedComponentsTranslations = prefixKeys(componentsTranslations, 'stripes-components');
   const prefixedCoreTranslations = prefixKeys(coreTranslations, 'stripes-core');

   const allTranslations = { ...prefixedComponentsTranslations, ...prefixedCoreTranslations };

   return (
     <Provider store={store}>
       <IntlProvider locale="en" key="en" timeZone="UTC" messages={allTranslations}>
         {this.props.children}
       </IntlProvider>
     </Provider>
   );
 }
}

const RouterHarness = ({ children }) => {

  return (<MemoryRouter>{children}</MemoryRouter>);
};

export default RouterHarness;
