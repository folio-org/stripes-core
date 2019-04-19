/* external utilities */
export { ConnectContext as RootContext, withConnect as withRoot } from '@folio/stripes-connect';

/* internal utilities */
export { stripesShape } from './src/Stripes';
export { withStripes } from './src/StripesContext';
export { default as stripesConnect } from './src/stripesConnect';
export { default as Pluggable } from './src/Pluggable';
export { setServicePoints, setCurServicePoint } from './src/loginServices';
export { default as coreEvents } from './src/events';

/* components */
export { default as AppContextMenu } from './src/components/MainNav/CurrentApp/AppContextMenu';
export { default as IfInterface } from './src/components/IfInterface';
export { default as IfPermission } from './src/components/IfPermission';
export { default as TitleManager } from './src/components/TitleManager';
export { default as HandlerManager } from './src/components/HandlerManager';
export { default as IntlConsumer } from './src/components/IntlConsumer';
export { default as AppIcon } from './src/components/AppIcon';
export { Route, Switch, Redirect } from './src/components/NestedRouter';

/* test scaffolding */
export { default as setupStripesCore } from './test/bigtest/helpers/setup-application';
export { default as startMirage } from './test/bigtest/network/start';
