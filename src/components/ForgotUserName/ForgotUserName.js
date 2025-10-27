import React, { useState } from 'react';
import {
  Redirect,
} from 'react-router-dom';

import processBadResponse from '../../processBadResponse';
import ForgotUserNameForm from './ForgotUserNameForm';
import useForgotUsernameMutation from './useForgotUsernameMutation';
import { validateForgotUsernameForm as isValidUsername } from '../../validators';

const ForgotUserName = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [isValidInput, setIsValidInput] = useState(true);
  const [authFailure, setAuthFailure] = useState([]);
  const sendReminderMutation = useForgotUsernameMutation();

  const handleSubmit = async (values) => {
    setUserEmail(null);
    setAuthFailure([]);
    const { userInput } = values;

    if (isValidUsername(userInput)) {
      try {
        await sendReminderMutation.mutateAsync(userInput);
        setUserEmail(userInput);
      } catch (error) {
        if (error.response.status === 400) {
          // Do not display the information that the email address or phone number was invalid for password recovery,
          // as per OWASP guidelines https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#password-recovery

          // Set user input to redirect to the "/check-email" page
          setUserEmail(userInput);
          return;
        }

        const res = await processBadResponse(undefined, error.response);
        setIsValidInput(true);
        setAuthFailure(res);
      }
    } else {
      setIsValidInput(false);
    }
  };

  if (userEmail) {
    return <Redirect to={{ pathname: '/check-email', state: { userEmail } }} />;
  }

  return (
    <ForgotUserNameForm
      isValid={isValidInput}
      errors={authFailure}
      onSubmit={handleSubmit}
    />
  );
};

export default ForgotUserName;
