/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const consortiumShape = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  activeAffiliation: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  centralTenant: PropTypes.string,
  userPrimaryTenant: PropTypes.string,
});
