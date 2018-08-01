const userDropdownChecks = {

  isLocalLogin(props) {
    return !props.okapi.ssoEnabled;
  }
};

export default userDropdownChecks;
