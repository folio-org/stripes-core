import PropTypes from 'prop-types';
import {
  Headline,
  List,
} from '@folio/stripes-components';

import css from './About.css';


const AboutInterfaces = ({ list = [] }) => {
  list.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <List
      listStyle="bullets"
      listClass={css.paddingLeftOfListItems}
      items={list}
      itemFormatter={(item) => <li key={item.name}>{item.name}</li>}
    />
  );
};

AboutInterfaces.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object),
};

const AboutModules = ({ list = [] }) => {
  list.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <List
      listStyle="bullets"
      listClass={css.paddingLeftOfListItems}
      items={list}
      itemFormatter={(item) => {
        return (
          <li key={item.name}>
            <Headline weight="medium" margin="xx-small">
              {item.name}
            </Headline>
            <AboutInterfaces list={item.interfaces} />
          </li>
        );
      }}
    />
  );
};

AboutModules.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object),
};

export default AboutModules;
