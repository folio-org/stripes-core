import React, { useState } from 'react';
import { useHistory } from 'react-router';

import processBadResponse from '../../processBadResponse';
import { defaultErrors } from '../../constants';
import ForgotUserNameForm from './ForgotUserNameForm';
import useForgotUsernameMutation from './useForgotUsernameMutation';
import { validateForgotUsernameForm as isValidUsername } from '../../validators';

const ForgotUserName = () => {
  const history = useHistory();
  const [isValidInput, setIsValidInput] = useState(true);
  const [authFailure, setAuthFailure] = useState([]);
  const sendReminderMutation = useForgotUsernameMutation();

  const handleSubmit = async (values) => {
    setAuthFailure([]);
    const { userInput } = values;
    const { FORGOTTEN_USERNAME_CLIENT_ERROR } = defaultErrors;

    if (isValidUsername(userInput)) {
      try {
        await sendReminderMutation.mutateAsync(userInput);
        history.push('/check-email', { userEmail: userInput });
      } catch (error) {
        const res = await processBadResponse(undefined, error.response, FORGOTTEN_USERNAME_CLIENT_ERROR);
        setIsValidInput(true);
        setAuthFailure(res);
      }
    } else {
      setIsValidInput(false);
    }
  };

  return (
    <ForgotUserNameForm
      isValid={isValidInput}
      errors={authFailure}
      onSubmit={handleSubmit}
    />
  );
};

export default ForgotUserName;
