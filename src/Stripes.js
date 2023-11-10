import _ from 'lodash';
import PropTypes from 'prop-types';
import { isVersionCompatible } from './discoverServices';


export const stripesShape = PropTypes.shape({
  // Properties provided by the class
  clone: PropTypes.func.isRequired,
  hasInterface: PropTypes.func.isRequired,
  hasPerm: PropTypes.func.isRequired,

  // Properties passed into the constructor by the caller
  actionNames: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  bindings: PropTypes.object,
  config: PropTypes.shape({
    disableAuth: PropTypes.bool,
    hasAllPerms: PropTypes.bool,
    listInvisiblePerms: PropTypes.bool,
    logCategories: PropTypes.string,
    logPrefix: PropTypes.string,
    logTimestamp: PropTypes.bool,
    showHomeLink: PropTypes.bool,
    showPerms: PropTypes.bool,
  }).isRequired,
  connect: PropTypes.func.isRequired,
  currency: PropTypes.string,
  discovery: PropTypes.shape({
    interfaces: PropTypes.object,
    isFinished: PropTypes.bool,
    okapi: PropTypes.string,
    modules: PropTypes.object,
  }),
  epics: PropTypes.shape({
    add: PropTypes.func.isRequired,
    middleware: PropTypes.func.isRequired,
  }),
  icons: PropTypes.object,
  locale: PropTypes.string,
  logger: PropTypes.shape({
    log: PropTypes.func.isRequired,
  }).isRequired,
  metadata: PropTypes.object,
  okapi: PropTypes.shape({
    authFailure:  PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    okapiReady: PropTypes.bool,
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string,
    translations: PropTypes.object,
    url: PropTypes.string.isRequired,
    withoutOkapi: PropTypes.bool,
  }).isRequired,
  plugins: PropTypes.object,
  setBindings: PropTypes.func.isRequired,
  setCurrency: PropTypes.func.isRequired,
  setLocale: PropTypes.func.isRequired,
  setSinglePlugin: PropTypes.func.isRequired,
  setTimezone: PropTypes.func.isRequired,
  setToken: PropTypes.func.isRequired,
  store: PropTypes.shape({
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    replaceReducer: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
  }),
  timezone: PropTypes.string,
  user: PropTypes.shape({
    perms: PropTypes.object,
    user: PropTypes.shape({
      addresses: PropTypes.arrayOf(PropTypes.object),
      email: PropTypes.string,
      firstName: PropTypes.string,
      id: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      username: PropTypes.string.isRequired,
    }),
  }),
  withOkapi: PropTypes.bool.isRequired,
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
