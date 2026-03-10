import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8082/api';

export interface ApiBook {
  bookId: number;
  bookName: string;
  authorName: string;
  publisherName: string;
  category: string;
  available: boolean | null;
  totalQuantity: number;
  availableQuantity: number | null;
  [key: string]: any;
}

export interface AddBookRequest {
  bookName: string;
  authorName: string;
  publisherName: string;
  category: string;
  available: boolean;
  totalQuantity: number;
  availableQuantity: number;
}

export interface BorrowBookItem {
  bookid: number;
  quantityrequested: number;
}

export interface BorrowBookRequest {
  userId: string;
  bookList: BorrowBookItem[];
}

export interface BorrowBookResponse {
  message: string;
  processInstanceKey: string;
}

@Injectable({ providedIn: 'root' })
export class BookApiService {
  constructor(private http: HttpClient) {}

  getAllBooks(): Observable<ApiBook[]> {
    return this.http.get<ApiBook[]>(`${API_BASE}/books`);
  }

  addBook(book: AddBookRequest): Observable<ApiBook> {
    return this.http.post<ApiBook>(`${API_BASE}/books`, book);
  }

  borrowBooks(request: BorrowBookRequest): Observable<BorrowBookResponse> {
    return this.http.post<BorrowBookResponse>(
      `${API_BASE}/bookrequest/borrow`,
      request,
    );
  }
}
