import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ppid } from 'process';
import { LoginStore } from './login.store';
import { LoginOTPModal } from './login-otp.modal';
export interface LoginRequest {
  username: string;
  password: string;
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, LoginOTPModal],
  template: ` <div>
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <p>Username/Email</p>
      <input
        type="text"
        formControlName="username"
        id="username"
        placeholder="Enter your Username / Email"
      />
      <p>Password</p>
      <input
        type="password"
        formControlName="password"
        id="password"
        placeholder="Enter your password"
      />
      <br/>
      <span id="error" class="text-red-500">Test</span>
      <div>
        <button type="submit" class="h-20">Login</button>
      </div>
    </form>
    <!-- <otp-verify-modal [userId]="userId" /> -->
  </div>`,
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;
  userId: number|null=null;
  private readonly loginStore = inject(LoginStore);
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  onSubmit(): void {
    const newLoginRequest: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };
    try {
      this.loginStore.onLoginRequest(newLoginRequest);
    } catch (err) {
      console.log('Error' + err);
    }
  }
}
