import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MembershipApiService } from '../../../services/membership.service';
import {
  TransactionService,
  PendingRequest,
} from '../../../services/transaction.service';

@Component({
  selector: 'app-member-my-requests',
  templateUrl: './member-my-requests.component.html',
  styleUrls: ['./member-my-requests.component.scss'],
})
export class MemberMyRequestsComponent implements OnInit {
  pendingRequests: PendingRequest[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private transactionService: TransactionService,
    private membershipApi: MembershipApiService,
  ) {}

  ngOnInit(): void {
    this.resolveUserIdAndLoad();
  }

  /**
   * Gets userId from localStorage (AuthService).
   * If not present, fetches by email from the users API, stores it, then loads.
   */
  private resolveUserIdAndLoad(): void {
    const userId = this.auth.getUserId();
    if (userId) {
      this.loadPendingRequests(userId);
      return;
    }

    // Fallback: fetch user details by email and store the userId
    const email = this.auth.getCurrentUser()?.email;
    if (!email) {
      this.errorMessage = 'Unable to determine user. Please log in again.';
      return;
    }

    this.loading = true;
    this.membershipApi.getUserByEmail(email).subscribe({
      next: (userDetails) => {
        // Persist userId in localStorage for future calls
        const currentUser = this.auth.getCurrentUser();
        if (currentUser) {
          currentUser.userId = userDetails.id;
          this.auth.updateStoredUser(currentUser);
        }
        this.loadPendingRequests(userDetails.id);
      },
      error: () => {
        this.errorMessage = 'Failed to fetch user details. Please try again.';
        this.loading = false;
      },
    });
  }

  private loadPendingRequests(userId: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.transactionService.getPendingRequests(userId).subscribe({
      next: (res) => {
        this.pendingRequests = res.pendingRequests || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load pending requests', err);
        this.errorMessage =
          'Failed to load pending requests. Please try again later.';
        this.loading = false;
      },
    });
  }

  getTotalBooks(req: PendingRequest): number {
    return req.books.reduce((sum, b) => sum + b.quantityRequested, 0);
  }
}
