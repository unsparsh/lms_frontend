import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8082/api';

/* ── Borrowed Transactions (top-level) ── */
export interface BorrowedTransaction {
  transactionid: number;
  booklist: string;
}

export interface BorrowedResponse {
  data: BorrowedTransaction[];
}

/* ── Line Items (per-transaction book details) ── */
export interface BorrowedBookLineItem {
  line_items_id: number;
  bookName: string;
  due_date: string;            // e.g. "2026-03-06"
}

/* ── Pending Requests ── */
export interface PendingBookItem {
  bookId: number;
  bookName: string;
  quantityRequested: number;
}

export interface PendingRequest {
  bookCombineRequestId: string;
  books: PendingBookItem[];
}

export interface PendingRequestsResponse {
  userId: string;
  pendingRequests: PendingRequest[];
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private http: HttpClient) {}

  /** Get all borrowed transactions for a user */
  getBorrowedBooks(userId: string): Observable<BorrowedResponse> {
    return this.http.get<BorrowedResponse>(
      `${API_BASE}/transactions/borrowed/${userId}`,
    );
  }

  /** Get line-item details (book name + due date) for a specific transaction */
  getBorrowedBookDetails(transactionId: number): Observable<BorrowedBookLineItem[]> {
    return this.http.get<BorrowedBookLineItem[]>(
      `${API_BASE}/transactions/${transactionId}/borrowed-books`,
    );
  }

  /** Return one or more books by their line_items_id */
  returnBooks(lineItemIds: number[]): Observable<any> {
    return this.http.put(`${API_BASE}/transactions/return-books`, {
      bookList: lineItemIds.map(id => ({ line_items_id: id })),
    }, { responseType: 'text' });
  }

  /** Extend return date for selected line items by a number of days */
  extendReturnDate(lineItemIds: number[], days: number): Observable<any> {
    return this.http.post(`${API_BASE}/book/extend`, {
      extensionDuration: days,
      bookList: lineItemIds.map(id => ({ line_items_id: id })),
    }, { responseType: 'text' });
  }

  getPendingRequests(userId: string): Observable<PendingRequestsResponse> {
    return this.http.get<PendingRequestsResponse>(
      `${API_BASE}/book-requests/pending/${userId}`,
    );
  }
}
