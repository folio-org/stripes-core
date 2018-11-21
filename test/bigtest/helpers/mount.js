// replace the dummy app to mount the component
import {
  clearModules,
  withModules
} from './stripes-config';

export default function mount(component) {
  clearModules();

  withModules([{
    type: 'app',
    name: '@folio/ui-dummy',
    displayName: 'dummy.title',
    route: '/dummy',
    module: () => component
  }]);
}
