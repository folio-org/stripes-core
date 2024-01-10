import React from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';
import { withStripes } from './StripesContext';

const withOkapiKy = (WrappedComponent) => {
  class HOC extends React.Component {
    static propTypes = {
      stripes: PropTypes.shape({
        okapi: PropTypes.shape({
          locale: PropTypes.string,
          tenant: PropTypes.string.isRequired,
          timeout: PropTypes.number,
          token: PropTypes.string,
          url: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    };

    constructor(props) {
      super();
      const { tenant, token, url, timeout = 30000, locale = 'en' } = props.stripes.okapi;
      this.okapiKy = ky.create({
        credentials: 'include',
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set('Accept-Language', locale);
              request.headers.set('X-Okapi-Tenant', tenant);
              if (token) {
                request.headers.set('X-Okapi-Token', token);
              }
            }
          ]
        },
        mode: 'cors',
        prefixUrl: url,
        retry: 0,
        timeout,
      });
    }

    render() {
      return <WrappedComponent {...this.props} okapiKy={this.okapiKy} />;
    }
  }

  return withStripes(HOC);
};

export default withOkapiKy;
