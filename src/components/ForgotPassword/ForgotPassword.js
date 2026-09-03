import React, { useState } from 'react';
import { useHistory } from 'react-router';

import processBadResponse from '../../processBadResponse';
import { defaultErrors } from '../../constants';
import ForgotPasswordForm from './ForgotPasswordForm';
import useForgotPasswordMutation from './useForgotPasswordMutation';

const ForgotPassword = () => {
  const history = useHistory();
  const [authFailure, setAuthFailure] = useState([]);
  const sendReminderMutation = useForgotPasswordMutation();

  const onSubmit = async (values) => {
    setAuthFailure([]);
    const { userInput } = values;
    const { FORGOTTEN_PASSWORD_CLIENT_ERROR } = defaultErrors;

    try {
      await sendReminderMutation.mutateAsync(userInput);
      history.push('/check-email', { userEmail: userInput });
    } catch (error) {
      const res = await processBadResponse(undefined, error.response, FORGOTTEN_PASSWORD_CLIENT_ERROR);
      setAuthFailure(res);
    }
  };

  return (
    <ForgotPasswordForm
      errors={authFailure}
      onSubmit={onSubmit}
    />
  );
};

export default ForgotPassword;
