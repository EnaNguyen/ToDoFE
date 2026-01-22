import { Component, Injectable, inject } from '@angular/core';
import { userLogin, verifyOTP } from './models/user.account';
import { CommonModule } from '@angular/common';
import { loginRequest } from './models/user.account';
import { userInfo } from 'os';
import { Observable, tap, switchMap, catchError, of, pipe } from 'rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthServices } from '../../../services/AuthServices';
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
  showOTPModal: boolean;
}
const initialState: UserState = {
  user: {
    result: '',
    message: '',
  },
  isLoading: false,
  error: null,
  showOTPModal: false,
};
@Injectable({
  providedIn: 'root',
})
export class LoginStore extends ComponentStore<UserState> {
  constructor() {
    super(initialState);
  }
  readonly http = inject(HttpClient);
  private readonly authService = inject(AuthServices);
  readonly user$: Observable<UserInfo> = this.select((state) => state.user);
  readonly showOTPModal$: Observable<boolean> = this.select((state) => state.showOTPModal);
  readonly setError = this.updater((state, error: string) => ({
    ...state,
    isLoading: false,
    error,
    showOTPModal: false,
  }));
  private storeUserData(user: UserInfo): void {
    console.log('Storing user data:', user);
    window.localStorage.setItem('userData', JSON.stringify(user));
  }
  readonly onLoginRequest = this.effect<loginRequest>((request$) =>
    request$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((request) =>
        this.http
          .post<UserInfo>(`${environment.apiUrl}/login`, request, { withCredentials: true })
          .pipe(
            tap((response: UserInfo) => {
              console.log(response);
              if (response.result == '2') {
                this.patchState({ showOTPModal: true, user: response });
              } else if (response.result == '1') {
                this.authService.setUser({
                  userId: response.userId!,
                  fullName: response.fullName!,
                  username: response.username!,
                  role: response.role!,
                });
                this.storeUserData(response);
                this.patchState({
                  showOTPModal: false,
                  user: response,
                  error: null,
                  isLoading: false,
                });
              } else {
                this.patchState({ showOTPModal: false });
              }
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
          ),
      ),
    ),
  );
  readonly VerifyOTP = this.effect<verifyOTP>((otpInput) =>
    otpInput.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((a) =>
        this.http.post<UserInfo>(`${environment.apiUrl}/login/otp-verify`, a).pipe(
          tap((response: UserInfo) => {
            console.log(response);
            if (response.result == '1') {
              this.authService.setUser({
                userId: response.userId!,
                fullName: response.fullName!,
                username: response.username!,
                role: response.role!,
              });
              this.storeUserData(response);
              this.patchState({
                showOTPModal: false,
                user: response,
                error: null,
                isLoading: false,
              });
            } else {
              this.patchState({
                isLoading: false,
                error: response.message,
              });
            }
          }),
          catchError((err) => {
            this.patchState({
              isLoading: false,
              error: 'Fail to Verify, Please try again',
            });
            return of(null);
          }),
        ),
      ),
    ),
  );
  readonly reSendOTP = this.effect<number>((userId$) =>
    userId$.pipe(
      tap(() => this.patchState({ isLoading: true, error: null })),
      switchMap((userId) =>
        this.http.get<boolean>(`${environment.apiUrl}/login/otp-resent/${userId}`).pipe(
          tap((success: boolean) => {
            if (success) {
              this.patchState({
                isLoading: false,
                error: null,
              });
              alert('OTP has been resent successfully.');
            } else {
              this.patchState({
                isLoading: false,
                error: 'Cant resend OTP. Please try again.',
              });
            }
          }),
          catchError((err) => {
            this.patchState({
              isLoading: false,
              error: 'Cant resend OTP. Please try again.',
            });
            return of(null);
          }),
        ),
      ),
    ),
  );
}
