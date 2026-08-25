export type TypeUserUsername = string;
export type TypeUserPassword = string;

export enum UserRoleEnum {
    ADMIN = "ADMIN",
    SUPPORT = "SUPPORT",
    SUPERVISOR = "SUPERVISOR",
}

export interface IUser {
    username: TypeUserUsername;
    role: UserRoleEnum;
}

export interface IUserForm extends IUser {
    password: TypeUserPassword;
}
