export type PersistUser<TUserData> = (userId: string, userData: TUserData) => void | Promise<void>;
