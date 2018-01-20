const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/utils/asPlugin');

require('jasmine-expect');
const {
  asPlugin,
  asPluginProvider,
} = require('/src/services/utils/asPlugin');

describe('services/utils:asPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return `true` when woopack is present', () => {
    // Given
    jest.setMock('woopack', () => ({}));
    let result = null;
    // When
    result = asPlugin();
    // Then
    expect(result).toBeTrue();
  });

  it('should return `false` when woopack is not present', () => {
    // Given
    jest.mock('woopack', () => {
      throw new Error('Module not present');
    });
    let result = null;
    // When
    result = asPlugin();
    // Then
    expect(result).toBeFalse();
  });

  it('should include a provider for the DIC', () => {
    // Given
    jest.setMock('woopack', () => ({}));
    let result = null;
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    asPluginProvider(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    result = serviceFn();
    // Then
    expect(serviceName).toBe('asPlugin');
    expect(serviceFn).toBeFunction();
    expect(result).toBeTrue();
  });
});