import React, { useState } from 'react';
import {
  Redirect,
} from 'react-router-dom';

import processBadResponse from '../../processBadResponse';
import { defaultErrors } from '../../constants';
import ForgotPasswordForm from './ForgotPasswordForm';
import useForgotPasswordMutation from './useForgotPasswordMutation';

const ForgotPassword = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [authFailure, setAuthFailure] = useState([]);
  const sendReminderMutation = useForgotPasswordMutation();

  const onSubmit = async (values) => {
    setUserEmail(null);
    setAuthFailure([]);
    const { userInput } = values;
    const { FORGOTTEN_PASSWORD_CLIENT_ERROR } = defaultErrors;

    try {
      await sendReminderMutation.mutateAsync(userInput);
      setUserEmail(userInput);
    } catch (error) {
      const res = await processBadResponse(undefined, error.response, FORGOTTEN_PASSWORD_CLIENT_ERROR);
      setAuthFailure(res);
    }
  };

  if (userEmail) {
    return <Redirect to={{ pathname: '/check-email', state: { userEmail } }} />;
  }

  return (
    <ForgotPasswordForm
      errors={authFailure}
      onSubmit={onSubmit}
    />
  );
};

export default ForgotPassword;
