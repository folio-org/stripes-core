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

//
// here be dragons, maybe. or if not dragons, something that is
// maybe poorly understood and _certainly_ poorly documented.
// consider visiting STCOR-592 before doing any major work here.
// redux-observable was a solid option for when we first
// implemented this, but there may be simpler options now.
//

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
