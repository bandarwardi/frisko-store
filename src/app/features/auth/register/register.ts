import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Sauth } from '../services/sauth';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fd = inject(FormBuilder);
  private sauth = inject(Sauth);
  private router = inject(Router);

  registerForm: FormGroup = this.fd.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/),
      ],
    ],
    phone: [''],
  });

  submitForm() {
    if (this.registerForm.valid) {
      // console.log(this.registerForm.value);
      this.sauth.signUp(this.registerForm.value).subscribe({
        next: (res) => {
          // console.log(res);
          if (res.success || res.message === 'تم إنشاء الحساب بنجاح' || res.data) {
            this.router.navigate(['/auth/login']);
          }
        },
        error: (err) => {
          // console.log(err);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
