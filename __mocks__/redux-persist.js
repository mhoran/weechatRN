const reduxPersist = jest.requireActual('redux-persist');
reduxPersist.persistReducer = jest
  .fn()
  .mockImplementation((config, reducers) => reducers);

module.exports = reduxPersist;
