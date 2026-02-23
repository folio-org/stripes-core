import PropTypes from 'prop-types';

import { Icon } from '@folio/stripes-components';

import css from './ReleaseNotesLink.css';

export const RELEASE_NOTES_LINK_ATTRS = {
  href: 'https://folio-org.atlassian.net/wiki/spaces/REL/overview#Release-notes',
  target: '_blank',
  rel: 'noopener noreferrer',
};

const ReleaseNotesLink = ({ children }) => {
  return (
    <span className={css.ReleaseNotesLink}>
      {children}

      <Icon icon="external-link" />
    </span>
  );
};

ReleaseNotesLink.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
};

export default ReleaseNotesLink;
