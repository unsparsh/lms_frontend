import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../models/user.model';

const API_BASE = 'http://localhost:8082/api/auth';
const CURRENT_USER_KEY = 'lms_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser(),
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private getStoredUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  private setUser(res: AuthResponse): void {
    const user: User = {
      id: res.id,
      userId: res.userId || res.id,
      token: res.token,
      email: res.email,
      role: res.role,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  updateStoredUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http
      .post<AuthResponse>(`${API_BASE}/login`, body)
      .pipe(tap((res) => this.setUser(res)));
  }

  register(
    name: string,
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    const body: RegisterRequest = { name, email, password, role: 'MEMBER' };
    return this.http
      .post<AuthResponse>(`${API_BASE}/register`, body)
      .pipe(tap((res) => this.setUser(res)));
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): string | null {
    return this.currentUserSubject.value?.userId ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isLibrarian(): boolean {
    return this.getCurrentUser()?.role === 'LIBRARIAN';
  }

  isMember(): boolean {
    return this.getCurrentUser()?.role === 'MEMBER';
  }

  isMembershipActive(): boolean {
    return this.getCurrentUser()?.membershipActive === true;
  }
}
