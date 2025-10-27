import React, { useState } from 'react';
import {
  Redirect,
} from 'react-router-dom';

import processBadResponse from '../../processBadResponse';
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

    try {
      await sendReminderMutation.mutateAsync(userInput);
      setUserEmail(userInput);
    } catch (error) {
      if (error.response.status === 400) {
        // When the email or phone number is not found, we get a 400 response.
        // Do not display the information that the email address or phone number was invalid for password recovery,
        // as per OWASP guidelines https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#password-recovery

        // Set user input to redirect to the "/check-email" page
        setUserEmail(userInput);
        return;
      }
      
      const res = await processBadResponse(undefined, error.response);
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
