export type UserDataDispatch<TUserData> = (
  input: ((prevUserData: TUserData) => TUserData) | TUserData
) => void | Promise<void>;
