export { RootContext } from './src/components/Root/RootContext';
export { stripesShape } from './src/Stripes';
export { withStripes } from './src/StripesContext';

export { default as Pluggable } from './src/Pluggable';
export { setServicePoints, setCurServicePoint } from './src/loginServices';
export { default as TitleManager } from './src/components/TitleManager';
export { default as HandlerManager } from './src/components/HandlerManager';
export { default as coreEvents } from './src/events';

export { default as setupStripesCore } from './test/bigtest/helpers/setup-application';
export { default as startMirage } from './test/bigtest/network/start';
