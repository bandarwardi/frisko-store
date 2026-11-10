import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Sauth } from '../services/sauth';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fd = inject(FormBuilder);
  private sauth = inject(Sauth);
  private router = inject(Router);

  loginForm: FormGroup = this.fd.group({
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
  });

  submitForm() {
    if (this.loginForm.valid) {
      // console.log(this.loginForm.value);
      this.sauth.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.data?.token || res.message === 'تم تسجيل الدخول بنجاح' || res.success) {
            localStorage.setItem('freshToken', res.data.token);
            localStorage.setItem('freshUser', JSON.stringify(res.data.user));
            this.sauth.isLogged.set(true);
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {},
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
