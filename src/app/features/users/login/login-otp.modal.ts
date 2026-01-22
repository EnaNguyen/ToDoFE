import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  ViewChild,
  afterNextRender,
  Input,
  input,
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validator,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { LoginStore } from './login.store';
import { verifyOTP } from './models/user.account';
import { verify } from 'crypto';
@Component({
  selector: 'otp-verify-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  template: `<el-dialog>
    <dialog
      id="loginModal"
      aria-labelledby="dialog-title"
      class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
      [open]="showModal"
    >
      <el-dialog-backdrop
        class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      ></el-dialog-backdrop>

      <div
        tabindex="0"
        class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0"
      >
        <el-dialog-panel
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg xl:max-w-[1200px] data-closed:sm:translate-y-0 data-closed:sm:scale-95"
        >
          <form [formGroup]="OTPForm" (ngSubmit)="onSubmit()">
            <h1>Enter your OTP we sent to your email</h1>
            <p>Your OTP:</p>
            <input
              type="text"
              placeholder="Enter Your OTP"
              formControlName="OTPInput"
              id="OTPInput"
            />
            <button type="button" (click)="reSent()">Re-sent OTP</button>
            <button type="submit">Verify</button>
          </form>
        </el-dialog-panel>
      </div>
    </dialog>
  </el-dialog>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginOTPModal {
  @Input() userId: number | null = null;
  @Input() show: boolean = false;
  @ViewChild('loginModal') loginModal!: ElementRef;
  private readonly loginStore = inject(LoginStore);
  showModal: boolean = false;
  OTPForm!: FormGroup;
  constructor(private fb: FormBuilder) {
    this.OTPForm = this.fb.group({
      OTPInput: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.loginStore.showOTPModal$.subscribe((show) => {
      this.showModal = show;
    });
  }
  onSubmit() {
    const OTP = this.OTPForm.value.OTPInput;
    const DataSent : verifyOTP = {
      userId: this.userId!,
      OTPCode: OTP,
    };
    console.log('Submitting OTP:', DataSent);
    this.loginStore.VerifyOTP(DataSent);
  }
  reSent() {
    this.loginStore.reSendOTP(this.userId!);
  }
}
