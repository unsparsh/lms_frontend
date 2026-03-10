import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MembershipApiService } from '../../../services/membership.service';
import { ToastService } from '../../../services/toast.service';

interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  months: number;
  price: string;
  features: string[];
  popular: boolean;
}

@Component({
  selector: 'app-member-membership',
  templateUrl: './member-membership.component.html',
  styleUrls: ['./member-membership.component.scss'],
})
export class MemberMembershipComponent implements OnInit {
  isActive = false;
  activatingPlanId: string | null = null;

  /** After applying, show approval pending screen */
  approvalPending = false;

  plans: MembershipPlan[] = [
    {
      id: 'ONE_MONTH',
      name: 'Basic',
      duration: '1 Months',
      months: 3,
      price: '₹499',
      features: [
        'Borrow up to 2 books',
        'Access to general collection',
        'Email notifications',
      ],
      popular: false,
    },
    {
      id: 'SIX_MONTH',
      name: 'Standard',
      duration: '6 Months',
      months: 6,
      price: '₹899',
      features: [
        'Borrow up to 5 books',
        'Access to all collections',
        'Email & SMS notifications',
        'Priority requests',
      ],
      popular: true,
    },
    {
      id: 'ONE_YEAR',
      name: 'Premium',
      duration: '12 Months',
      months: 12,
      price: '₹1499',
      features: [
        'Borrow up to 10 books',
        'Access to all collections',
        'Email & SMS notifications',
        'Priority requests',
        'Extended due dates',
        'Fine discount (50%)',
      ],
      popular: false,
    },
  ];

  constructor(
    private auth: AuthService,
    private membershipApi: MembershipApiService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkCurrentStatus();
  }

  /**
   * Check current membership status from the backend on load.
   */
  private checkCurrentStatus(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.isActive = false;
      return;
    }

    this.membershipApi.getMembershipStatus(userId).subscribe({
      next: (statusText) => {
        const status = statusText?.trim().toUpperCase();
        if (status === 'ACTIVE') {
          this.isActive = true;
        } else if (status === 'PENDING') {
          this.approvalPending = true;
          this.isActive = false;
        } else {
          this.isActive = false;
        }
      },
      error: () => {
        this.isActive = false;
      },
    });
  }

  activatePlan(plan: MembershipPlan): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.toast.danger('User not found. Please log in again.');
      return;
    }

    const userId = user.userId;
    if (!userId) {
      this.toast.danger('User ID not found. Please log out and log in again.');
      return;
    }

    this.activatingPlanId = plan.id;

    this.membershipApi.applyMembership(userId, plan.id).subscribe({
      next: (res) => {
        this.activatingPlanId = null;
        this.toast.success(
          res.message ||
            `${plan.name} plan application submitted! Your membership is under review.`,
        );

        // Show the pending approval screen
        this.approvalPending = true;

        // Update stored user
        user.membershipActive = false;
        user.membershipStatus = 'PENDING';
        this.auth.updateStoredUser(user);
      },
      error: (err) => {
        this.activatingPlanId = null;
        const message =
          err.error?.message ||
          err.error?.error ||
          'Failed to submit membership application. Please try again.';
        this.toast.danger(message);
      },
    });
  }

  /** Log out and go back to login so user can log in once approved */
  goToLogin(): void {
    this.auth.logout();
  }
}
