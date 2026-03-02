import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {
  TransactionService,
  BorrowedTransaction,
  BorrowedBookLineItem,
} from '../../../services/transaction.service';

/** Extended transaction with fetched line-item details */
interface TransactionWithDetails extends BorrowedTransaction {
  lineItems: BorrowedBookLineItem[];
  loadingItems: boolean;
}

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss'],
})
export class MemberDashboardComponent implements OnInit {
  transactions: TransactionWithDetails[] = [];
  loading = false;
  errorMessage = '';

  /* ── Action Modal State ── */
  showActionModal = false;
  selectedTxn: TransactionWithDetails | null = null;
  selectedItems: BorrowedBookLineItem[] = [];   // multi-select
  actionLoading = false;
  actionMessage = '';
  actionMessageType: 'success' | 'error' = 'success';

  /* ── Extend Date State ── */
  showExtendPicker = false;
  extendDays: number = 15;  // dropdown: 15 or 30

  constructor(
    private auth: AuthService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (userId) {
      this.loadBorrowedBooks(userId);
    }
  }

  /* ── Data Loading ── */

  private loadBorrowedBooks(userId: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.transactionService.getBorrowedBooks(userId).subscribe({
      next: (res) => {
        const txns = (res.data || []).map((t) => ({
          ...t,
          lineItems: [] as BorrowedBookLineItem[],
          loadingItems: true,
        }));
        this.transactions = txns;
        this.loading = false;

        // Fetch line-item details for each transaction
        txns.forEach((txn) => this.loadLineItems(txn));
      },
      error: (err) => {
        console.error('Failed to load borrowed books', err);
        this.errorMessage =
          'Failed to load borrowed books. Please try again later.';
        this.loading = false;
      },
    });
  }

  private loadLineItems(txn: TransactionWithDetails): void {
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

  /** Total active book count across all transactions */
  get totalBookCount(): number {
    return this.transactions.reduce(
      (sum, t) => sum + (t.lineItems?.length || 0),
      0,
    );
  }

  /* ── Date Helpers ── */

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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

  isOverdue(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < new Date().setHours(0, 0, 0, 0);
  }

  /** Earliest due date across line items of a transaction */
  getEarliestDueDate(txn: TransactionWithDetails): string {
    if (!txn.lineItems?.length) return '';
    return txn.lineItems.reduce(
      (earliest, item) =>
        item.due_date < earliest ? item.due_date : earliest,
      txn.lineItems[0].due_date,
    );
  }

  /* ── Modal Actions ── */

  openActions(txn: TransactionWithDetails): void {
    this.selectedTxn = txn;
    this.selectedItems = [];
    this.actionMessage = '';
    this.showExtendPicker = false;
    this.extendDays = 15;

    // Auto-select all if only one book
    if (txn.lineItems.length === 1) {
      this.selectedItems = [...txn.lineItems];
    }

    this.showActionModal = true;
  }

  closeActions(): void {
    this.showActionModal = false;
    this.selectedTxn = null;
    this.selectedItems = [];
    this.showExtendPicker = false;
    this.actionMessage = '';
  }

  /** Toggle a book in the selection */
  toggleItem(item: BorrowedBookLineItem): void {
    const idx = this.selectedItems.findIndex(
      (i) => i.line_items_id === item.line_items_id,
    );
    if (idx >= 0) {
      this.selectedItems.splice(idx, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.actionMessage = '';
    this.showExtendPicker = false;
  }

  /** Check if a book is selected */
  isSelected(item: BorrowedBookLineItem): boolean {
    return this.selectedItems.some(
      (i) => i.line_items_id === item.line_items_id,
    );
  }

  /** Select / deselect all books */
  toggleSelectAll(): void {
    if (!this.selectedTxn) return;
    if (this.selectedItems.length === this.selectedTxn.lineItems.length) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.selectedTxn.lineItems];
    }
  }

  get allSelected(): boolean {
    return (
      !!this.selectedTxn &&
      this.selectedItems.length === this.selectedTxn.lineItems.length
    );
  }

  /** Return the selected books */
  returnBooks(): void {
    if (!this.selectedTxn || this.selectedItems.length === 0) return;

    this.actionLoading = true;
    this.actionMessage = '';

    const ids = this.selectedItems.map((i) => i.line_items_id);
    console.log('Returning books with line_items_ids:', ids);

    this.transactionService.returnBooks(ids).subscribe({
      next: (response) => {
        console.log('Return API response:', response);
        const count = this.selectedItems.length;
        this.actionMessage = `${count} book${count > 1 ? 's' : ''} returned successfully!`;
        this.actionMessageType = 'success';
        this.actionLoading = false;

        const userId = this.auth.getUserId();
        if (userId) {
          setTimeout(() => {
            this.closeActions();
            this.loadBorrowedBooks(userId);
          }, 1500);
        }
      },
      error: (err) => {
        console.error('Return API error:', err);
        console.error('Error status:', err.status);
        console.error('Error body:', err.error);
        this.actionMessage =
          err.error?.message || 'Failed to return book(s). Please try again.';
        this.actionMessageType = 'error';
        this.actionLoading = false;
      },
    });
  }

  /** Show the extend options */
  showExtendOptions(): void {
    this.showExtendPicker = true;
    this.extendDays = 15;
    this.actionMessage = '';
  }

  /** Submit the extend date request */
  extendDate(): void {
    if (!this.selectedTxn || this.selectedItems.length === 0) return;

    this.actionLoading = true;
    this.actionMessage = '';

    const ids = this.selectedItems.map((i) => i.line_items_id);

    this.transactionService
      .extendReturnDate(
        ids,
        this.extendDays,
      )
      .subscribe({
        next: () => {
          this.actionMessage = 'extension is sent for approval, kindly wait!';
          this.actionMessageType = 'success';
          this.actionLoading = false;

          const userId = this.auth.getUserId();
          if (userId) {
            setTimeout(() => {
              this.closeActions();
              this.loadBorrowedBooks(userId);
            }, 1500);
          }
        },
        error: (err) => {
          console.error('Extend API error:', err);
          this.actionMessage =
            err.error?.message || 'Failed to extend return date. Please try again.';
          this.actionMessageType = 'error';
          this.actionLoading = false;
        },
      });
  }
}
