import _ from 'lodash';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { isVersionCompatible } from './discoverServices';


export const stripesShape = PropTypes.shape({
  // Properties provided by the class
  hasPerm: PropTypes.func.isRequired,
  hasInterface: PropTypes.func.isRequired,
  clone: PropTypes.func.isRequired,

  // Properties passed into the constructor by the caller
  logger: PropTypes.shape({
    log: PropTypes.func.isRequired,
  }).isRequired,
  store: PropTypes.shape({
    getState: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    replaceReducer: PropTypes.func.isRequired,
  }),
  epics: PropTypes.shape({
    add: PropTypes.func.isRequired,
    middleware: PropTypes.func.isRequired,
  }),
  config: PropTypes.shape({
    logCategories: PropTypes.string,
    logPrefix: PropTypes.string,
    logTimestamp: PropTypes.bool,
    showPerms: PropTypes.bool,
    showHomeLink: PropTypes.bool,
    listInvisiblePerms: PropTypes.bool,
    disableAuth: PropTypes.bool,
    hasAllPerms: PropTypes.bool,
  }).isRequired,
  okapi: PropTypes.shape({
    withoutOkapi: PropTypes.bool,
    url: PropTypes.string.isRequired,
    tenant: PropTypes.string.isRequired,
    okapiReady: PropTypes.bool,
    authFailure: PropTypes.bool,
    translations: PropTypes.object,
    token: PropTypes.string,
  }).isRequired,
  withOkapi: PropTypes.bool.isRequired,
  setToken: PropTypes.func.isRequired,
  actionNames: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  locale: PropTypes.string,
  timezone: PropTypes.string,
  metadata: PropTypes.object,
  setLocale: PropTypes.func.isRequired,
  setTimezone: PropTypes.func.isRequired,
  plugins: PropTypes.object,
  setSinglePlugin: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
  formatDateTime: PropTypes.func.isRequired,
  formatAbsoluteDate: PropTypes.func.isRequired,
  bindings: PropTypes.object,
  setBindings: PropTypes.func.isRequired,
  discovery: PropTypes.shape({
    okapi: PropTypes.stripes,
    modules: PropTypes.object,
    interfaces: PropTypes.object,
    isFinished: PropTypes.bool,
  }),
  user: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      addresses: PropTypes.arrayOf(PropTypes.object),
    }),
    perms: PropTypes.object,
  }),
  connect: PropTypes.func.isRequired,
  intl: intlShape,
});


class Stripes {
  constructor(properties) {
    Object.assign(this, properties);
  }

  hasPerm(perm) {
    const logger = this.logger;
    if (this.config && this.config.hasAllPerms) {
      logger.log('perm', `assuming perm '${perm}': hasAllPerms is true`);
      return true;
    }
    if (!this.user.perms) {
      logger.log('perm', `not checking perm '${perm}': no user permissions yet`);
      return undefined;
    }

    const ok = _.every(perm.split(','), p => !!this.user.perms[p]);
    logger.log('perm', `checking perm '${perm}': `, ok);
    return ok;
  }

  hasInterface(name, versionWanted) {
    const logger = this.logger;
    if (!this.discovery || !this.discovery.interfaces) {
      logger.log('interface', `not checking interface '${name}': no discovery yet`);
      return undefined;
    }
    const version = this.discovery.interfaces[name];
    if (!version) {
      logger.log('interface', `interface '${name}' is missing`);
      return undefined;
    }
    if (!versionWanted) {
      logger.log('interface', `interface '${name}' exists`);
      return true;
    }
    const ok = isVersionCompatible(version, versionWanted);
    const cond = ok ? 'is' : 'is not';
    logger.log('interface', `interface '${name}' v${versionWanted} ${cond} compatible with available v${version}`);
    return ok ? version : 0;
  }

  clone(extraProps) {
    return new Stripes(Object.assign({}, this, extraProps));
  }
}

export default Stripes;
