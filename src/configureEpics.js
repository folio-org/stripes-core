import {
  combineEpics,
  createEpicMiddleware,
  ofType,
} from 'redux-observable';
import { BehaviorSubject } from 'rxjs';
import {
  mergeMap,
  takeUntil,
} from 'rxjs/operators';

import { actionTypes } from './mainActions';

export default function configureEpics(...initialEpics) {
  const middleware = createEpicMiddleware();
  const epic$ = new BehaviorSubject(combineEpics(...initialEpics));
  const rootEpic = (action$, store) => {
    return epic$.pipe(
      mergeMap(epic => epic(action$, store)),
      takeUntil(action$.pipe(
        ofType(actionTypes.DESTROY_STORE)
      )),
    );
  };

  return {
    middleware,
    rootEpic,
    add: (...epics) => {
      epics.forEach(epic => epic$.next(epic));
    },
  };
}
