import { useRef } from 'react';
import { useIntl } from 'react-intl';

import { Icon } from '@folio/stripes-components';

import Pluggable from '../../../Pluggable';
import { useStripes } from '../../../StripesContext';
import NavButton from '../NavButton';

import css from './MainNavButtons.css';

export const MainNavButtons = () => {
  const intl = useIntl();
  const stripes = useStripes();

  const helpUrl = useRef(stripes.config.helpUrl ?? 'https://docs.folio.org').current;

  return (
    <div className={css.mainNavButtons}>
      <Pluggable type="notifications" />

      <NavButton
        aria-label={intl.formatMessage({ id: 'stripes-core.help' })}
        data-test-item-help-button
        href={helpUrl}
        icon={<Icon
          icon="question-mark"
          size="large"
        />}
        id="helpButton"
        target="_blank"
      />
    </div>
  );
};
