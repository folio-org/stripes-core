function resetStore() {
  console.log("returning RESET_STORE action");
  return {
    type: 'RESET_STORE',
  };
}

export { resetStore };
