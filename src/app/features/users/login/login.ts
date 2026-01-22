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
import { AuthServices } from '../../../services/AuthServices';
import { Router } from '@angular/router';
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
    <otp-verify-modal [userId]="userId" [show]="showModal" />
  </div>`,
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;
  userId: number|null=null;
  showModal: boolean = false;
  private readonly loginStore = inject(LoginStore);
  private readonly authService = inject(AuthServices);
  private readonly router = inject(Router);
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    // if (this.authService.isLogginedIn()) {
    //   console.log('Already logged in (from storage) → redirect immediately');
    //   this.router.navigate(['/'], { replaceUrl: true });
    // }
  }
  ngOnInit() {
  this.loginStore.user$.subscribe((userInfo) => { 
    this.userId = userInfo?.userId ?? null;
  });

  this.loginStore.showOTPModal$.subscribe((show) => {
    this.showModal = show;
  });
  // this.authService.currentUser$.subscribe((user) => {
  //   if (user) {
  //     console.log('User already logged in → redirecting');
  //     this.router.navigate(['/'] , {replaceUrl: true});  
  //   }
  // });
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
