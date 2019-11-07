export type RetrieveUser<TUserData> = (userId: string) => TUserData | Promise<TUserData>;
