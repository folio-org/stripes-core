import 'regenerator-runtime/runtime';
import { enableFetchMocks } from 'jest-fetch-mock';

// See https://github.com/facebook/jest/issues/335#issuecomment-703691592
import './__mock__';

enableFetchMocks();
