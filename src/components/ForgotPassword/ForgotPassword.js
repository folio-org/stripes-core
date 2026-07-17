import React, { useState } from 'react';
import {
  Redirect,
} from 'react-router-dom';
import { useIntl } from 'react-intl';

import ForgotPasswordForm from './ForgotPasswordForm';
import useForgotPasswordMutation from './useForgotPasswordMutation';
import { useCallout } from '../../CalloutContext';

const ForgotPassword = () => {
  const callout = useCallout();
  const intl = useIntl();

  const [userEmail, setUserEmail] = useState(null);
  const sendReminderMutation = useForgotPasswordMutation();

  const onSubmit = async (values) => {
    setUserEmail(null);
    const { userInput } = values;

    try {
      await sendReminderMutation.mutateAsync(userInput);
      setUserEmail(userInput);
    } catch (error) {
      callout.sendCallout({
        type: 'error',
        message: intl.formatMessage({ id: 'stripes-core.errors.default.server.error' }),
      });
    }
  };

  if (userEmail) {
    return <Redirect to={{ pathname: '/check-email', state: { userEmail } }} />;
  }

  return (
    <ForgotPasswordForm
      onSubmit={onSubmit}
    />
  );
};

export default ForgotPassword;
