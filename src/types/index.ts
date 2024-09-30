export interface NewUserRequest {
    name: string;
    email: string;
    password: string;
}
export interface SignInRequest {
    email: string;
    password: string;
}

export interface ForgetPassReq {
    email: string;
}
