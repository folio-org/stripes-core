import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import AboutInstallMessages, {
  entryFor,
  installDate,
  installMessage,
  installVersion,
} from './AboutInstallMessages';

import Harness from '../../../test/jest/helpers/harness';
import useOkapiEnv from '../../queries/useOkapiEnv';
import useConfigurations from '../../queries/useConfigurations';

jest.mock('../../queries/useOkapiEnv');
jest.mock('../../queries/useConfigurations');

describe('entryFor', () => {
  const config = {
    configs: [{
      code: 'thunder',
      value: 'chicken',
    }]
  };
  it('should find a matching entry', () => {
    expect(entryFor(config, 'thunder')).toBe('chicken');
  });

  it('should return empty string for missing entry', () => {
    expect(entryFor(config, 'monkey')).toBe('');
  });

  it('should return empty string for missing configs', () => {
    expect(entryFor({}, 'monkey')).toBe('');
  });
});

describe('installVersion', () => {
  it('should prefer env over conf, stripesConf', () => {
    const env = { ABOUT_INSTALL_VERSION: 'env' };
    const conf = { configs: [{ code: 'version', value: 'conf' }] };
    const stripesConf = { aboutInstallVersion: 'stripes.config' };

    expect(installVersion(env, conf, stripesConf)).toBe(env.ABOUT_INSTALL_VERSION);
  });

  it('should prefer conf over stripesConf', () => {
    const env = { };
    const conf = { configs: [{ code: 'version', value: 'conf' }] };
    const stripesConf = { aboutInstallVersion: 'stripes.config' };

    expect(installVersion(env, conf, stripesConf)).toBe(conf.configs[0].value);
  });

  it('should find a stripesConf value', () => {
    const env = { };
    const conf = { };
    const stripesConf = { aboutInstallVersion: 'stripes.config' };

    expect(installVersion(env, conf, stripesConf)).toBe(stripesConf.aboutInstallVersion);
  });

  it('should return empty string for missing configs', () => {
    expect(installDate()).toBe('');
  });
});

describe('installDate', () => {
  it('should prefer env over conf, stripesConf', () => {
    const env = { ABOUT_INSTALL_DATE: 'env' };
    const conf = { configs: [{ code: 'date', value: 'conf' }] };
    const stripesConf = { aboutInstallDate: 'stripes.config' };

    expect(installDate(env, conf, stripesConf)).toBe(env.ABOUT_INSTALL_DATE);
  });

  it('should prefer conf over stripesConf', () => {
    const env = { };
    const conf = { configs: [{ code: 'date', value: 'conf' }] };
    const stripesConf = { aboutInstallDate: 'stripes.config' };

    expect(installDate(env, conf, stripesConf)).toBe(conf.configs[0].value);
  });

  it('should find a stripesConf value', () => {
    const env = { };
    const conf = { };
    const stripesConf = { aboutInstallDate: 'stripes.config' };

    expect(installDate(env, conf, stripesConf)).toBe(stripesConf.aboutInstallDate);
  });

  it('should return empty string for missing configs', () => {
    expect(installDate()).toBe('');
  });
});

describe('installMessage', () => {
  it('should prefer env over conf, stripesConf', () => {
    const env = { ABOUT_INSTALL_MESSAGE: 'env' };
    const conf = { configs: [{ code: 'message', value: 'conf' }] };
    const stripesConf = { aboutInstallMessage: 'stripes.config' };

    expect(installMessage(env, conf, stripesConf)).toBe(env.ABOUT_INSTALL_MESSAGE);
  });

  it('should prefer conf over stripesConf', () => {
    const env = { };
    const conf = { configs: [{ code: 'message', value: 'conf' }] };
    const stripesConf = { aboutInstallMessage: 'stripes.config' };

    expect(installMessage(env, conf, stripesConf)).toBe(conf.configs[0].value);
  });

  it('should find a stripesConf value', () => {
    const env = { };
    const conf = { };
    const stripesConf = { aboutInstallMessage: 'stripes.config' };

    expect(installMessage(env, conf, stripesConf)).toBe(stripesConf.aboutInstallMessage);
  });

  it('should return empty string for missing configs', () => {
    expect(installMessage()).toBe('');
  });
});

describe('AboutInstallMessages', () => {
  beforeEach(async () => {
    const mockUseOkapiEnv = useOkapiEnv;
    mockUseOkapiEnv.mockReturnValue({
      data: {
        ABOUT_INSTALL_VERSION: '1.2.3',
        ABOUT_INSTALL_DATE: '2022-08-01T13:25:00Z',
        ABOUT_INSTALL_MESSAGE: 'Don\'t pussyfoot the thunder chicken',
      }
    });

    const mockUseConfigurations = useConfigurations;
    mockUseConfigurations.mockReturnValue({
      data: {
        configs: [
          // { code: 'version', value: 'monkey' },
        ]
      }
    });

    const stripes = {
      config: {},
      hasPerm: jest.fn(),
    };

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <AboutInstallMessages stripes={stripes} />
      </Harness>
    );
  });


  it('finds a version', () => {
    expect(screen.getByText(/1\.2\.3/)).toBeInTheDocument();
  });

  it('finds an install date', () => {
    expect(screen.getByText(/2022/)).toBeInTheDocument();
  });

  it('finds an install message', () => {
    expect(screen.getByText(/thunder chicken/)).toBeInTheDocument();
  });
});

describe('finds conditional fields', () => {
  it('finds an install-date even when no install-version is present', () => {
    const mockUseOkapiEnv = useOkapiEnv;
    mockUseOkapiEnv.mockReturnValue({
      data: {
        ABOUT_INSTALL_DATE: '2022-08-01T13:25:00Z',
        ABOUT_INSTALL_MESSAGE: 'Don\'t pussyfoot the thunder chicken',
      }
    });

    const mockUseConfigurations = useConfigurations;
    mockUseConfigurations.mockReturnValue({
      data: {
        configs: [
          // { code: 'version', value: 'monkey' },
        ]
      }
    });

    const stripes = {
      config: {},
      hasPerm: jest.fn(),
    };

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <AboutInstallMessages stripes={stripes} />
      </Harness>
    );

    expect(screen.getByText(/2022/)).toBeInTheDocument();
  });
});

describe('finds conditional fields', () => {
  it('finds an install-version when no install-date is present', () => {
    const mockUseOkapiEnv = useOkapiEnv;
    mockUseOkapiEnv.mockReturnValue({
      data: {
        ABOUT_INSTALL_VERSION: '1.2.3',
      }
    });

    const mockUseConfigurations = useConfigurations;
    mockUseConfigurations.mockReturnValue({
      data: {
        configs: [
          // { code: 'version', value: 'monkey' },
        ]
      }
    });

    const stripes = {
      config: {},
      hasPerm: jest.fn(),
    };

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <AboutInstallMessages stripes={stripes} />
      </Harness>
    );

    expect(screen.getByText(/1\.2\.3/)).toBeInTheDocument();
  });
});
