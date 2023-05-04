import localforage from 'localforage';

import {
  fetchConsortia,
  fetchConsortiumTenants,
  fetchConsortiumUserAffiliations,
  fetchCurrentConsortiumData,
  updateConsortium,
} from './consortiaService';
import {
  setConsortiumData,
  setCurrentTenant,
} from './okapiActions';

const okapiSess = {
  user: {
    id: 'user-id',
    username: 'test_user',
  },
};

jest.mock('localforage', () => ({
  getItem: jest.fn(() => Promise.resolve(okapiSess)),
  setItem: jest.fn((data) => Promise.resolve({ ...okapiSess, ...data })),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const token = 'qwerty123';
const xOkapiTenantHeader = 'X-Okapi-Tenant';
const xOkapiTokenHeader = 'X-Okapi-Token';
const defaultOkapiUrl = 'https://example.org';
const defaultOkapiTenant = 'diku';

const consortiaResponse = {
  consortia: [{
    id: 'consortium-id',
    name: 'MOBIUS',
  }],
  totalRecords: 1,
};
const consortiumTenantsResponse = {
  tenants: [
    { id: 'diku', name: 'Institutional tenant' },
  ],
};

const consortiumUserAffiliationsResponse = {
  userTenants: [
    {
      id: 'affiliation-id',
      tenantId: consortiumTenantsResponse.tenants[0].id,
      tenantName: consortiumTenantsResponse.tenants[0].name,
      userId: okapiSess.user.id,
      username: okapiSess.user.username,
      isPrimary: true,
    },
  ],
};

const nativeFetch = global.fetch;

// fetch success: resolve promise with ok == true and $data in json()
const mockFetchSuccess = () => {
  global.fetch = jest.fn((url) => {
    const getResponse = (json) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(json),
    });
    const consortiumId = consortiaResponse.consortia[0].id;

    if (new RegExp(`^${defaultOkapiUrl}/consortia$`).test(url)) {
      return getResponse(consortiaResponse);
    }
    if (new RegExp(`^${defaultOkapiUrl}/consortia/${consortiumId}/tenants$`).test(url)) {
      return getResponse(consortiumTenantsResponse);
    }
    if (new RegExp(`^${defaultOkapiUrl}/consortia/${consortiumId}/user-tenants\\?userId=${okapiSess.user.id}$`).test(url)) {
      return getResponse(consortiumUserAffiliationsResponse);
    }

    return getResponse();
  });
};

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  global.fetch = nativeFetch;
};

describe('consortiaService', () => {
  describe('updateConsortium', () => {
    const store = {
      dispatch: jest.fn(),
    };
    const data = {
      activeAffiliation: {
        id: 'affiliation-id',
        tenantName: 'Central tenant',
        tenantId: 'mobius',
      }
    };

    beforeEach(() => {
      store.dispatch.mockClear();
    });

    it('should not update current okapi tenant if data does not contain \'activeAffiliation\' to update', async () => {
      await updateConsortium(store, {});

      expect(store.dispatch).toBeCalledTimes(1);
      expect(store.dispatch).toBeCalledWith(setConsortiumData({}));
    });

    it('should update consortium data in the okapi session and dispatches actions to update consortium data and current okapi tenant', async () => {
      await updateConsortium(store, data);

      expect(localforage.getItem).toHaveBeenCalledWith('okapiSess');
      expect(localforage.setItem).toHaveBeenCalledWith('okapiSess', { ...okapiSess, consortium: { ...(okapiSess.consortium || {}), ...data } });
      expect(store.dispatch).toHaveBeenNthCalledWith(1, setConsortiumData(data));
      expect(store.dispatch).toHaveBeenNthCalledWith(2, setCurrentTenant(data.activeAffiliation.tenantId));
    });
  });

  describe('fetchConsortia', () => {
    it('should fetch and return current consortium', async () => {
      mockFetchSuccess();

      const response = await fetchConsortia(defaultOkapiUrl, defaultOkapiTenant).then(res => res.json());

      expect(global.fetch).toBeCalledWith(
        `${defaultOkapiUrl}/consortia`,
        {
          headers: expect.objectContaining({
            [xOkapiTenantHeader]: defaultOkapiTenant,
          })
        },
      );
      expect(response).toEqual(consortiaResponse);
      mockFetchCleanUp();
    });
  });

  describe('fetchConsortiumTenants', () => {
    it('should fetch and return tenants which are a part of current consortium', async () => {
      mockFetchSuccess();

      const options = { consortiumId: consortiaResponse.consortia[0].id };
      const response = await fetchConsortiumTenants(
        defaultOkapiUrl,
        defaultOkapiTenant,
        options,
      ).then(res => res.json());

      expect(global.fetch).toBeCalledWith(
        `${defaultOkapiUrl}/consortia/${options.consortiumId}/tenants`,
        {
          headers: expect.objectContaining({
            [xOkapiTenantHeader]: defaultOkapiTenant,
          })
        },
      );
      expect(response).toEqual(consortiumTenantsResponse);
      mockFetchCleanUp();
    });
  });

  describe('fetchConsortiumUserAffiliations', () => {
    it('should fetch and return affiliations between user and consortium tenants', async () => {
      mockFetchSuccess();

      const options = {
        consortiumId: consortiaResponse.consortia[0].id,
        userId: okapiSess.user.id,
      };
      const response = await fetchConsortiumUserAffiliations(
        defaultOkapiUrl,
        defaultOkapiTenant,
        token,
        options,
      ).then(res => res.json());

      expect(global.fetch).toBeCalledWith(
        `${defaultOkapiUrl}/consortia/${options.consortiumId}/user-tenants?userId=${options.userId}`,
        {
          headers: expect.objectContaining({
            [xOkapiTenantHeader]: defaultOkapiTenant,
            [xOkapiTokenHeader]: token,
          })
        },
      );
      expect(response).toEqual(consortiumUserAffiliationsResponse);
      mockFetchCleanUp();
    });
  });

  describe('fetchCurrentConsortiumData', () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          url: defaultOkapiUrl,
          token,
        }
      }),
    };

    beforeEach(() => {
      store.dispatch.mockClear();
    });

    it('should return data related to current consortium, set it to okapi session and set active affiliation', async () => {
      mockFetchSuccess();

      const response = await fetchCurrentConsortiumData(store, { user: okapiSess.user });

      expect(response).toEqual(expect.objectContaining({
        id: consortiaResponse.consortia[0].id,
        name: consortiaResponse.consortia[0].name,
        userPrimaryTenant: consortiumUserAffiliationsResponse.userTenants[0].tenantId,
      }));

      mockFetchCleanUp();
    });
  });
});
