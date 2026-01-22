export interface userLogin {
  userId?: number;
  fullName?: string;
  username?: string;
  role?: string;
}
export interface loginRequest{
  username: string;
  password: string;
}
export interface verifyOTP{
  userId: number;
  OTPCode: string;
}