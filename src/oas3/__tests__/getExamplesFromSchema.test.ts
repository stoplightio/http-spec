import { getExamplesFromSchema } from '../transformers/getExamplesFromSchema';

describe('getExamplesFromSchema', () => {
  it('should ignore invalid data', () => {
    // @ts-ignore
    expect(getExamplesFromSchema(null)).toEqual({});
  });

  it('should work with x-examples', () => {
    expect(getExamplesFromSchema(schema)).toEqual({
      devices: [
        {
          deviceID: '123',
          deviceName: 'frontDoorLock',
          deviceClass: 'safety',
          spaceID: 'home',
          alexaCompatible: true,
          storageUsed: 0.003,
          storageFree: 1,
        },
        {
          deviceID: '789',
          deviceName: 'sprinkler',
          deviceClass: 'convenience',
          spaceID: 'yard',
          alexaCompatible: false,
          storageUsed: 0.0018,
          storageFree: 1,
        },
      ],
      device: [
        {
          deviceID: 'abc',
          deviceName: 'welcomeDroid',
          deviceClass: 'commercial',
          spaceID: 'office',
          alexaCompatible: true,
          storageUsed: 137,
          storageFree: 300,
        },
      ],
    });
  });
});

const schema = {
  title: 'Device',
  type: 'object',
  'x-tags': ['devices', 'IOT'],
  description:
    'Describes a device activated on a **CloudHome** account. Each class can contain more than one device and location, centrally managed by the CloudHome service cloud.',
  'x-examples': {
    devices: [
      {
        deviceID: '123',
        deviceName: 'frontDoorLock',
        deviceClass: 'safety',
        spaceID: 'home',
        alexaCompatible: true,
        storageUsed: 0.003,
        storageFree: 1,
      },
      {
        deviceID: '789',
        deviceName: 'sprinkler',
        deviceClass: 'convenience',
        spaceID: 'yard',
        alexaCompatible: false,
        storageUsed: 0.0018,
        storageFree: 1,
      },
    ],
    device: [
      {
        deviceID: 'abc',
        deviceName: 'welcomeDroid',
        deviceClass: 'commercial',
        spaceID: 'office',
        alexaCompatible: true,
        storageUsed: 137,
        storageFree: 300,
      },
    ],
  },
};
