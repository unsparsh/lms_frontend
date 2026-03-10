import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LibrarianGuard } from './guards/role.guard';
import { MemberGuard } from './guards/role.guard';
import { MembershipGuard } from './guards/membership.guard';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';

import { LibrarianDashboardComponent } from './components/librarian/librarian-dashboard/librarian-dashboard.component';
import { LibrarianBooksComponent } from './components/librarian/librarian-books/librarian-books.component';
import { LibrarianMembersComponent } from './components/librarian/librarian-members/librarian-members.component';
import { LibrarianRequestsComponent } from './components/librarian/librarian-requests/librarian-requests.component';
import { LibrarianReportsComponent } from './components/librarian/librarian-reports/librarian-reports.component';
import { LibrarianMailLogComponent } from './components/librarian/librarian-mail-log/librarian-mail-log.component';

import { MemberDashboardComponent } from './components/member/member-dashboard/member-dashboard.component';
import { MemberBrowseComponent } from './components/member/member-browse/member-browse.component';
import { MemberMyRequestsComponent } from './components/member/member-my-requests/member-my-requests.component';

import { MemberReportsComponent } from './components/member/member-reports/member-reports.component';
import { MemberMembershipComponent } from './components/member/member-membership/member-membership.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'librarian/dashboard', pathMatch: 'full' },
      {
        path: 'librarian',
        canActivate: [LibrarianGuard],
        children: [
          { path: 'dashboard', component: LibrarianDashboardComponent },
          { path: 'books', component: LibrarianBooksComponent },
          { path: 'members', component: LibrarianMembersComponent },
          { path: 'requests', component: LibrarianRequestsComponent },
          { path: 'reports', component: LibrarianReportsComponent },
          { path: 'mail-log', component: LibrarianMailLogComponent },
        ],
      },
      {
        path: 'member',
        canActivate: [MemberGuard],
        children: [
          { path: 'membership', component: MemberMembershipComponent },
          {
            path: 'dashboard',
            component: MemberDashboardComponent,
            canActivate: [MembershipGuard],
          },
          {
            path: 'browse',
            component: MemberBrowseComponent,
            canActivate: [MembershipGuard],
          },
          {
            path: 'my-requests',
            component: MemberMyRequestsComponent,
            canActivate: [MembershipGuard],
          },

          {
            path: 'reports',
            component: MemberReportsComponent,
            canActivate: [MembershipGuard],
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
