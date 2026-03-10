import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8082/api/membership';
const USERS_API_BASE = 'http://localhost:8082/api/users1';

export interface MembershipApplyRequest {
  userId: string;
  membershipType: string;
}

export interface MembershipApplyResponse {
  message: string;
  processInstanceKey: string;
}

export interface UserDetailsResponse {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class MembershipApiService {
  constructor(private http: HttpClient) {}

  applyMembership(
    userId: string,
    membershipType: string,
  ): Observable<MembershipApplyResponse> {
    const body: MembershipApplyRequest = { userId, membershipType };
    return this.http.post<MembershipApplyResponse>(`${API_BASE}/apply`, body);
  }

  /**
   * Check membership status from the backend.
   * GET /api/membership/status/{userId}
   * Returns a plain string: "PENDING" or "ACTIVE"
   */
  getMembershipStatus(userId: string): Observable<string> {
    return this.http.get(`${API_BASE}/status/${userId}`, {
      responseType: 'text',
    });
  }

  /**
   * Fetch user details by userId (UUID).
   * GET /api/users1/{userId}
   */
  getUserById(userId: string): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(`${USERS_API_BASE}/${userId}`);
  }

  /**
   * Fetch user details by email.
   * GET /api/users1/email/{email}
   */
  getUserByEmail(email: string): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(
      `${USERS_API_BASE}/email/${email}`,
    );
  }
}
