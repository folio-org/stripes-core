import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Headline } from '@folio/stripes-components';
import { FormattedMessage } from 'react-intl';

import Pluggable from '../Pluggable';
import ReleaseNotesLink, { RELEASE_NOTES_LINK_ATTRS } from './ReleaseNotesLink';

import css from './Front.css';

const Front = ({ stripes }) => {
  const tag = get(stripes, 'config.welcomeMessage') || 'stripes-core.front.welcome';

  return (
    <Pluggable type="frontpage">
      <div className={css.frontWrap}>
        <Headline faded tag="h1" margin="none" className={css.frontTitle}><FormattedMessage id={tag} /></Headline>

        <div className={css.releaseNotesWrap}>
          <a {...RELEASE_NOTES_LINK_ATTRS}>
            <ReleaseNotesLink>
              <FormattedMessage id="stripes-core.releaseNotes.front" />
            </ReleaseNotesLink>
          </a>
        </div>
      </div>
    </Pluggable>
  );
};


Front.propTypes = {
  stripes: PropTypes.shape({
    config: PropTypes.shape({
      welcomeMessage: PropTypes.string,
    }),
  }),
};

export default Front;
