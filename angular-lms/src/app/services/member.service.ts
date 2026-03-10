import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.model';

const MEMBERS_KEY = 'lms_members';
const API_BASE = 'http://localhost:8082/api';

/** Shape returned by GET /api/users1 */
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private getMembers(): Member[] {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private setMembers(members: Member[]): void {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  }

  constructor(private http: HttpClient) {
    this.seedMembers();
  }

  /** Fetch all users from backend API (requires auth token) */
  getAllUsersFromApi(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(`${API_BASE}/users1`);
  }

  private seedMembers(): void {
    const members = this.getMembers();
    if (members.length === 0) {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      const defaultMembers: Member[] = [
        { id: 'mem-1', name: 'John Member', email: 'member@lms.com', phone: '1234567890', membershipExpiry: expiry.toISOString().split('T')[0], status: 'approved', createdAt: new Date().toISOString(), fineBalance: 0 }
      ];
      this.setMembers(defaultMembers);
    }
  }

  getAllMembers(): Member[] {
    return this.getMembers();
  }

  getMemberById(id: string): Member | undefined {
    return this.getMembers().find(m => m.id === id);
  }

  getMemberByEmail(email: string): Member | undefined {
    return this.getMembers().find(m => m.email === email);
  }

  addMember(member: Omit<Member, 'id' | 'createdAt' | 'fineBalance'>): Member {
    const members = this.getMembers();
    const id = 'mem-' + (members.length + 1);
    const newMember: Member = {
      ...member,
      id,
      createdAt: new Date().toISOString(),
      fineBalance: 0
    };
    members.push(newMember);
    this.setMembers(members);
    return newMember;
  }

  updateMember(id: string, updates: Partial<Member>): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) return null;
    members[idx] = { ...members[idx], ...updates };
    this.setMembers(members);
    return members[idx];
  }

  approveMember(id: string): Member | null {
    return this.updateMember(id, { status: 'approved' });
  }

  rejectMember(id: string): Member | null {
    return this.updateMember(id, { status: 'rejected' });
  }

  addFine(memberId: string, amount: number): void {
    const member = this.getMemberById(memberId);
    if (member) {
      this.updateMember(memberId, { fineBalance: member.fineBalance + amount });
    }
  }
}
