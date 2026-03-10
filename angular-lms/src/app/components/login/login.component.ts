import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { MembershipApiService } from '../../services/membership.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  /** Status screen state */
  statusScreen: 'PENDING' | 'REJECTED' | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private membershipApi: MembershipApiService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.statusScreen = null;
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        const user = this.auth.getCurrentUser();
        if (!user) {
          this.loading = false;
          this.toast.danger('Login failed. User data not found.');
          return;
        }

        if (user.role === 'LIBRARIAN') {
          this.toast.success('Login successful! Welcome back.');
          this.router.navigate(['/librarian/dashboard']);
          return;
        }

        // For MEMBER role: fetch userId via email, then check membership
        this.membershipApi.getUserByEmail(email).subscribe({
          next: (userDetails) => {
            // Store the userId (UUID) from the users1 API
            user.userId = userDetails.id;
            user.name = userDetails.name;
            this.auth.updateStoredUser(user);

            // Now check membership status
            this.checkMembershipFromBackend(userDetails.id);
          },
          error: () => {
            this.loading = false;
            this.toast.success('Login successful!');
            this.toast.warning(
              'Could not fetch user details. Please try again.',
            );
            this.router.navigate(['/member/membership']);
          },
        });
      },
      error: (err) => {
        this.loading = false;
        const message =
          err.error?.message ||
          err.error?.error ||
          'Login failed. Please check your credentials.';
        this.toast.danger(message);
      },
    });
  }

  /**
   * Check membership status from the backend API.
   * The API returns a plain string: "PENDING" or "ACTIVE"
   * - ACTIVE   → allow access to member dashboard
   * - PENDING  → show "Approval under process" screen
   * - Other    → redirect to membership page
   */
  private checkMembershipFromBackend(userId: string): void {
    this.membershipApi.getMembershipStatus(userId).subscribe({
      next: (statusText) => {
        this.loading = false;
        const user = this.auth.getCurrentUser();
        if (!user) return;

        const status = statusText?.trim().toUpperCase();
        user.membershipStatus = status;

        if (status === 'ACTIVE') {
          user.membershipActive = true;
          this.auth.updateStoredUser(user);
          this.toast.success('Login successful! Welcome back.');
          this.router.navigate(['/member/dashboard']);
        } else if (status === 'PENDING') {
          user.membershipActive = false;
          this.auth.updateStoredUser(user);
          // Show the pending approval screen
          this.statusScreen = 'PENDING';
          this.auth.logout();
        } else {
          // No membership found or unknown status → go to membership page
          user.membershipActive = false;
          this.auth.updateStoredUser(user);
          this.toast.success('Login successful!');
          this.toast.warning(
            "You don't have an active membership. Please choose a plan to continue.",
          );
          this.router.navigate(['/member/membership']);
        }
      },
      error: () => {
        this.loading = false;
        const user = this.auth.getCurrentUser();
        if (!user) return;
        // If status API fails, assume no membership → redirect to membership page
        user.membershipActive = false;
        this.auth.updateStoredUser(user);
        this.toast.success('Login successful!');
        this.toast.warning(
          "You don't have an active membership. Please choose a plan to continue.",
        );
        this.router.navigate(['/member/membership']);
      },
    });
  }

  /** Return to login form from status screen */
  backToLogin(): void {
    this.statusScreen = null;
  }
}
