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

export interface UpdatePasswordRequest {
    password: string;
    token: string;
    userId: string;
}

export interface EmailVerifyRequest {
    token: string;
    userId: string;
}
