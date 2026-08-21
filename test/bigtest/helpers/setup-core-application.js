import setupApplication from './setup-application';

export default function setupCoreApplication(options = {}) {
  options.mirageOptions = { serverType: 'miragejs' };
  setupApplication(options);
}
