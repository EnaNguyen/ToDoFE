import { Component, Injectable, inject } from '@angular/core';
import { userLogin, verifyOTP } from './models/user.account';
import { CommonModule } from '@angular/common';
import { loginRequest } from './models/user.account';
import { userInfo } from 'os';
import { Observable, tap, switchMap, catchError, of, pipe } from 'rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
export interface UserInfo {
  userId?: number;
  fullName?: string;
  username?: string;
  role?: string;
  result: string;
  message: string;
}
export interface UserState {
  user: UserInfo;
  isLoading: boolean;
  error: string | null;
}
const initialState: UserState = {
  user: {
    result: '',
    message: '',
  },
  isLoading: false,
  error: null,
};
@Injectable({
  providedIn: 'root',
})
export class LoginStore extends ComponentStore<UserState> {
  constructor() {
    super(initialState);
  }
  readonly http = inject(HttpClient);
  readonly user$: Observable<UserInfo> = this.select((state) => state.user);
  readonly setError = this.updater((state, error: string) => ({
    ...state,
    isLoading: false,
    error,
  }));
  readonly onLoginRequest = this.effect<loginRequest>((request$) =>
    request$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((request) => this.http.post<UserInfo>(`${environment.apiUrl}/login`, request).pipe(
        tap((response: UserInfo) => {
          console.log(response);
        }),
        tap(() => this.patchState({ isLoading: false })),
        catchError((err) => {
          this.setError('Login Failed');
          this.patchState({
            isLoading: false,
            error: 'Fail to login, Please try again',
          });
          return of(null);
        }),
      ),)
    ),
  );
  readonly VerifyOTP = this.effect<verifyOTP>((otpInput)=>
    otpInput.pipe(
    tap(()=>this.patchState({isLoading:true})),
    switchMap((a)=> this.http.post<UserInfo>(`${environment.apiUrl}/login/otp-vefigy`, a).pipe(
        tap((response: UserInfo)=>{
            console.log(response);
        }),
        tap(()=>this.patchState({isLoading: false})),
        catchError((err) => {
          this.setError('Wrong OTP');
          this.patchState({
            isLoading: false,
            error: 'Fail to Verify, Please try again',
          });
          return of(null);
        }),
    ))
));
}
