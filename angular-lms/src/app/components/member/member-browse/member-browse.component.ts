import { Component, OnInit } from '@angular/core';
import {
  BookApiService,
  ApiBook,
  BorrowBookRequest,
} from '../../../services/book-api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-member-browse',
  templateUrl: './member-browse.component.html',
  styleUrls: ['./member-browse.component.scss'],
})
export class MemberBrowseComponent implements OnInit {
  books: ApiBook[] = [];
  filteredBooks: ApiBook[] = [];
  loading = true;
  searchTerm = '';

  // Borrow modal state
  showBorrowModal = false;
  borrowBook: ApiBook | null = null;
  borrowQuantity = 1;
  borrowing = false;

  constructor(
    private bookApi: BookApiService,
    private authService: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    this.loading = true;
    this.bookApi.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const message =
          err.error?.message ||
          err.error?.error ||
          'Failed to fetch books. Please try again.';
        this.toast.danger(message);
      },
    });
  }

  filterBooks(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBooks = this.books;
      return;
    }
    this.filteredBooks = this.books.filter(
      (b) =>
        b.bookName.toLowerCase().includes(term) ||
        b.authorName.toLowerCase().includes(term) ||
        (b.publisherName && b.publisherName.toLowerCase().includes(term)) ||
        b.category.toLowerCase().includes(term),
    );
  }

  onSummary(book: ApiBook): void {
    this.toast.success(`AI Summary requested for "${book.bookName}"`);
    // TODO: Integrate with AI summary API
  }

  onBorrow(book: ApiBook): void {
    this.borrowBook = book;
    this.borrowQuantity = 1;
    this.showBorrowModal = true;
  }

  get maxBorrowQuantity(): number {
    return this.borrowBook?.availableQuantity ?? 0;
  }

  incrementQuantity(): void {
    if (this.borrowQuantity < this.maxBorrowQuantity) {
      this.borrowQuantity++;
    }
  }

  decrementQuantity(): void {
    if (this.borrowQuantity > 1) {
      this.borrowQuantity--;
    }
  }

  closeBorrowModal(): void {
    this.showBorrowModal = false;
    this.borrowBook = null;
    this.borrowQuantity = 1;
  }

  confirmBorrow(): void {
    if (!this.borrowBook) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      this.toast.danger('User session not found. Please log in again.');
      return;
    }

    const request: BorrowBookRequest = {
      userId: userId,
      bookList: [
        {
          bookid: this.borrowBook.bookId,
          quantityrequested: this.borrowQuantity,
        },
      ],
    };

    this.borrowing = true;
    this.bookApi.borrowBooks(request).subscribe({
      next: (res) => {
        this.borrowing = false;
        this.toast.success(
          res.message || 'Borrow process started successfully!',
        );
        this.closeBorrowModal();
        this.fetchBooks(); // Refresh to update available quantities
      },
      error: (err) => {
        this.borrowing = false;
        const message =
          err.error?.message ||
          err.error?.error ||
          'Failed to borrow book. Please try again.';
        this.toast.danger(message);
      },
    });
  }
}
