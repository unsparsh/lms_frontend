import { Component, OnInit } from '@angular/core';
import { TransactionService, GroupedRequestUser } from '../../../services/transaction.service';

@Component({
  selector: 'app-librarian-requests',
  templateUrl: './librarian-requests.component.html',
  styleUrls: ['./librarian-requests.component.scss']
})
export class LibrarianRequestsComponent implements OnInit {
  groupedUsers: GroupedRequestUser[] = [];
  selectedUser: GroupedRequestUser | null = null;
  isModalOpen = false;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadGroupedRequests();
  }

  loadGroupedRequests(): void {
    this.transactionService.getGroupedRequests().subscribe({
      next: (data) => {
        this.groupedUsers = data;
      },
      error: (err) => {
        console.error('Error fetching grouped requests', err);
      }
    });
  }

  openUserRequests(user: GroupedRequestUser): void {
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
  }
}
