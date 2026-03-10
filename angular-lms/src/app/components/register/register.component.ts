import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { name, email, password } = this.form.value;

    this.auth.register(name, email, password).subscribe({
      next: () => {
        const user = this.auth.getCurrentUser();

        // If the auth response already included userId, go to membership
        if (user?.userId) {
          this.toast.success(
            'Account created successfully! Please choose a membership plan.',
          );
          this.router.navigate(['/member/membership']);
          return;
        }

        // Proceed to membership page even without userId
        this.toast.success(
          'Account created successfully! Please choose a membership plan.',
        );
        this.router.navigate(['/member/membership']);
      },
      error: (err) => {
        this.loading = false;
        const message =
          err.error?.message ||
          err.error?.error ||
          'Registration failed. Please try again.';
        this.toast.danger(message);
      },
    });
  }
}
