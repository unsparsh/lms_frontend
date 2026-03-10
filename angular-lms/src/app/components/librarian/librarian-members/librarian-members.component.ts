import { Component, OnInit } from '@angular/core';
import { MemberService, ApiUser } from '../../../services/member.service';
import {
  TransactionService,
  BorrowedTransaction,
  BorrowedBookLineItem,
} from '../../../services/transaction.service';

/** Transaction enriched with its line-item details */
interface TxnWithItems extends BorrowedTransaction {
  lineItems: BorrowedBookLineItem[];
  loadingItems: boolean;
}

@Component({
  selector: 'app-librarian-members',
  templateUrl: './librarian-members.component.html',
  styleUrls: ['./librarian-members.component.scss'],
})
export class LibrarianMembersComponent implements OnInit {
  /* ── Member list ── */
  users: ApiUser[] = [];
  filteredUsers: ApiUser[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';

  /* ── Borrowed Books Popup ── */
  showPopup = false;
  selectedUser: ApiUser | null = null;
  borrowedTxns: TxnWithItems[] = [];
  borrowedLoading = false;
  borrowedError = '';

  constructor(
    private memberService: MemberService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /* ────────────────── Data Loading ────────────────── */

  private loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.memberService.getAllUsersFromApi().subscribe({
      next: (data) => {
        this.users = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.errorMessage = 'Failed to load members. Please try again later.';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.role?.toLowerCase().includes(term),
      );
    }
  }

  /* ────────────────── Borrowed Books Popup ────────────────── */

  openUserBorrowed(user: ApiUser): void {
    this.selectedUser = user;
    this.borrowedTxns = [];
    this.borrowedError = '';
    this.borrowedLoading = true;
    this.showPopup = true;

    this.transactionService.getBorrowedBooks(user.id).subscribe({
      next: (res) => {
        const txns: TxnWithItems[] = (res.data || []).map((t) => ({
          ...t,
          lineItems: [] as BorrowedBookLineItem[],
          loadingItems: true,
        }));
        this.borrowedTxns = txns;
        this.borrowedLoading = false;

        // Fetch line-item details for each transaction
        txns.forEach((txn) => this.loadLineItems(txn));
      },
      error: (err) => {
        console.error('Failed to load borrowed books', err);
        this.borrowedError = 'Failed to load borrowed books for this user.';
        this.borrowedLoading = false;
      },
    });
  }

  private loadLineItems(txn: TxnWithItems): void {
    txn.loadingItems = true;
    this.transactionService
      .getBorrowedBookDetails(txn.transactionid)
      .subscribe({
        next: (items) => {
          txn.lineItems = items || [];
          txn.loadingItems = false;
        },
        error: () => {
          txn.loadingItems = false;
        },
      });
  }

  closePopup(): void {
    this.showPopup = false;
    this.selectedUser = null;
    this.borrowedTxns = [];
  }

  /** Total borrowed book count across all transactions for popup */
  get popupBookCount(): number {
    return this.borrowedTxns.reduce(
      (sum, t) => sum + (t.lineItems?.length || 0),
      0,
    );
  }

  /* ────────────────── Date Helpers ────────────────── */

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  isOverdue(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < new Date().setHours(0, 0, 0, 0);
  }

  isReturnDateNear(dateStr: string): boolean {
    if (!dateStr) return false;
    const ret = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil(
      (ret.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff >= 0 && diff <= 3;
  }
}
