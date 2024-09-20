import hideEmail from './hideEmail';

describe('hideEmail', () => {
  it('masks email addresses', () => {
    expect(hideEmail('test@example.com')).toEqual('te**@e******.***');
    expect(hideEmail('monkey@bagel.co.uk')).toEqual('mo****@b****.*****');
  });
});
