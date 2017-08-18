import { configureEpics } from '@folio/stripes-redux';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';

import connectErrorEpic from './connectErrorEpic';
import okapiReadyEpic from './okapiReadyEpic';

export default configureEpics(connectErrorEpic, okapiReadyEpic);
