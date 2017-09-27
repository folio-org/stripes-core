import React from 'react';
import PropTypes from 'prop-types';
import css from './Breadcrumbs.css';

const propTypes = {
  links: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

function Breadcrumbs(props) {
  const links = props.links.map((link, i) => {
    // eslint-disable-next-line react/no-array-index-key
    const linkElem = <li key={`breadcrumb_${i}`}><a href={link.path}>{link.label}</a></li>;
    // eslint-disable-next-line react/no-array-index-key
    const dividerElem = <li key={`divider${i}`}>{'>'}</li>;
    if (i !== props.links.length - 1) {
      return (linkElem + dividerElem);
    }
    return linkElem;
  });

  return (
    <ul className={css.navBreadcrumbs}>
      {links}
    </ul>
  );
}

Breadcrumbs.propTypes = propTypes;

export default Breadcrumbs;
