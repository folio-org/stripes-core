import PropTypes from 'prop-types';

import { Icon } from '@folio/stripes-components';

import css from './ReleaseNotesLink.css';

const ReleaseNotesLink = ({ label }) => {
  return (
    <a
      href="https://folio-org.atlassian.net/wiki/spaces/REL/overview#Release-notes"
      target="_blank"
      rel="noopener noreferrer"
      className={css.ReleaseNotesLink}
    >
      {label}

      <Icon icon="external-link" />
    </a>
  );
};

ReleaseNotesLink.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
};

export default ReleaseNotesLink;
