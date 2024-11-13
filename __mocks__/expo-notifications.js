import { PermissionStatus } from 'expo-modules-core';
module.exports = {
  PermissionStatus: PermissionStatus,
  getPermissionsAsync: jest.fn(() => ({ status: 'granted' }))
};
