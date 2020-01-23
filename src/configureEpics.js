import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/switchMap';

import { actionTypes } from './mainActions';

export default function configureEpics(...initialEpics) {
  const epic$ = new BehaviorSubject(combineEpics(...initialEpics));
  const rootEpic = (action$, store) => {
    return epic$
      .mergeMap(epic => epic(action$, store))
      .takeUntil(action$.ofType(actionTypes.DESTROY_STORE));
  };

  const middleware = createEpicMiddleware(rootEpic);

  return {
    middleware,
    add: (...epics) => {
      epics.forEach(epic => epic$.next(epic));
    },
  };
}
