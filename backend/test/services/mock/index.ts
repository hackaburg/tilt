type MockedMethods<T> = {
  [K in keyof T]:
    T[K] extends () => any
      ? jest.Mock
      : T[K];
};

export class MockedService<T> {
  public readonly mocks: MockedMethods<T>;

  public constructor(public readonly instance: T) {
    this.mocks = instance as MockedMethods<T>;
  }
}
