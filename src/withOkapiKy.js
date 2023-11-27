import React from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';
import { withStripes } from './StripesContext';

const withOkapiKy = (WrappedComponent) => {
  class HOC extends React.Component {
    static propTypes = {
      stripes: PropTypes.shape({
        okapi: PropTypes.shape({
          tenant: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
          timeout: PropTypes.number,
          locale: PropTypes.string,
        }).isRequired,
      }).isRequired,
    };

    constructor(props) {
      super();
      const { tenant, url, timeout = 30000, locale = 'en' } = props.stripes.okapi;
      this.okapiKy = ky.create({
        credentials: 'include',
        prefixUrl: url,
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set('X-Okapi-Tenant', tenant);
              request.headers.set('Accept-Language', locale);
            }
          ]
        },
        mode: 'cors',
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
