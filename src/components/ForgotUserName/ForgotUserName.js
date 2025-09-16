import React, { useState } from 'react';
import {
  Redirect,
} from 'react-router-dom';

import processBadResponse from '../../processBadResponse';
import { defaultErrors } from '../../constants';
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
    const { FORGOTTEN_USERNAME_CLIENT_ERROR } = defaultErrors;

    if (isValidUsername(userInput)) {
      try {
        await sendReminderMutation.mutateAsync(userInput);
        setUserEmail(userInput);
      } catch (error) {
        const res = await processBadResponse(undefined, error.response, FORGOTTEN_USERNAME_CLIENT_ERROR);
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
