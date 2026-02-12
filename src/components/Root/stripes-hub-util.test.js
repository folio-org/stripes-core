
import { getStripesHubConfig } from './stripes-hub-util';

describe('StripesHubUtil', () => {
  it('returns the correct config when StripesHub is present', () => {
    const okapi = { url: 'https://okapi.example.com' };
    const config = { name: 'test' };
    const stripesHub = {
      folioConfig: {
        name: 'StripesHub',
        gatewayUrl: 'https://stripes-hub.example.com',
        authnUrl: 'https://authn.example.com',
      },
    };

    const result = getStripesHubConfig(okapi, config, stripesHub);
    expect(result.stripesOkapi.url).toBe('https://stripes-hub.example.com');
    expect(result.stripesConfig.name).toBe('StripesHub');

    // Utitity should not pollute stripes config with values classic stripes stores in okapi config.
    expect(result.stripesConfig.discoveryUrl).toBeUndefined();
    expect(result.stripesConfig.gatewayUrl).toBeUndefined();
    expect(result.stripesConfig.authnUrl).toBeUndefined();
  });

  it('returns the original config when StripesHub is not present', () => {
    const okapi = { url: 'https://okapi.example.com' };
    const config = { name: 'test' };

    const result = getStripesHubConfig(okapi, config, null);
    expect(result.stripesOkapi.url).toBe('https://okapi.example.com');
    expect(result.stripesConfig.name).toBe('test');
  });
});
