/* external utilities */
export { ConnectContext as RootContext, withConnect as withRoot } from '@folio/stripes-connect';
export { CalloutContext, useCallout } from './src/CalloutContext';

/* internal utilities */
export { stripesShape, default as Stripes } from './src/Stripes';
export { withStripes, useStripes, StripesContext } from './src/StripesContext';
export { useModules, ModulesContext, originalModules } from './src/ModulesContext';
export { withModule, withModules } from './src/components/Modules';
export { default as stripesConnect } from './src/stripesConnect';
export { default as Pluggable } from './src/Pluggable';
export { updateUser } from './src/loginServices';
export { default as coreEvents } from './src/events';
export { default as useOkapiKy } from './src/useOkapiKy';
export { default as withOkapiKy } from './src/withOkapiKy';
export { default as useCustomFields } from './src/useCustomFields';

/* components */
export { AppContextMenu, AppCtxMenuContext, AppCtxMenuProvider, withAppCtxMenu } from './src/components/AppContextMenu';
export { default as IfInterface } from './src/components/IfInterface';
export { default as IfPermission } from './src/components/IfPermission';
export { default as TitleManager } from './src/components/TitleManager';
export { default as HandlerManager } from './src/components/HandlerManager';
export { default as IntlConsumer } from './src/components/IntlConsumer';
export { default as AppIcon } from './src/components/AppIcon';
export { Route, Switch, Redirect } from './src/components/NestedRouter';
export {
  ModuleHierarchyContext,
  ModuleHierarchyProvider,
  useModuleHierarchy,
  useNamespace,
  withNamespace,
  LastVisitedContext,
  withLastVisited,
} from './src/components';

/* misc */
export { supportedNumberingSystems, supportedLocales, userLocaleConfig } from './src/loginServices';
export { getEventHandler, getEventHandlers } from './src/handlerService';
export { default as queryLimit } from './src/queryLimit';
export { default as isVersionCompatible } from './src/isVersionCompatible';
