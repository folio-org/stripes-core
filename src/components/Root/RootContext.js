/* The context that lived here mainly provided a courier for redux-centric elements.
* it now is provided by stripes-connect. This is a temporary location of the export while some modules still import withRoot
* directly from this file.
*/

export { ConnectContext as RootContext, withConnect as withRoot } from '@folio/stripes-connect';
