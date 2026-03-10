import { Component, OnInit } from '@angular/core';
import {
  BookApiService,
  ApiBook,
  AddBookRequest,
} from '../../../services/book-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-librarian-books',
  templateUrl: './librarian-books.component.html',
  styleUrls: ['./librarian-books.component.scss'],
})
export class LibrarianBooksComponent implements OnInit {
  books: ApiBook[] = [];
  form: FormGroup;
  showForm = false;
  isSubmitting = false;

  constructor(
    private bookApiService: BookApiService,
    private fb: FormBuilder,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      bookName: ['', Validators.required],
      authorName: ['', Validators.required],
      publisherName: ['', Validators.required],
      category: ['', Validators.required],
      available: [true],
      totalQuantity: [1, [Validators.required, Validators.min(1)]],
      availableQuantity: [1, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookApiService.getAllBooks().subscribe({
      next: (books) => (this.books = books),
      error: (err) => {
        console.error('Failed to load books', err);
        this.toast.danger('Failed to load books');
      },
    });
  }

  openForm(): void {
    this.showForm = true;
    this.form.reset({
      available: true,
      totalQuantity: 1,
      availableQuantity: 1,
    });
  }

  closeForm(): void {
    this.showForm = false;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const val = this.form.value;
    const request: AddBookRequest = {
      bookName: val.bookName,
      authorName: val.authorName,
      publisherName: val.publisherName,
      category: val.category,
      available: val.available,
      totalQuantity: val.totalQuantity,
      availableQuantity: val.availableQuantity,
    };

    this.bookApiService.addBook(request).subscribe({
      next: (newBook) => {
        this.toast.success(`Book "${newBook.bookName}" added successfully!`);
        this.loadBooks();
        this.closeForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Failed to add book', err);
        this.toast.danger('Failed to add book. Please try again.');
        this.isSubmitting = false;
      },
    });
  }

  get categories(): string[] {
    return [
      'Fiction',
      'Non-Fiction',
      'Science',
      'Technology',
      'History',
      'Biography',
      'Children',
      'Polity',
      'Other',
    ];
  }
}
