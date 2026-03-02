import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ToastComponent } from './components/toast/toast.component';

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

import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    LayoutComponent,
    ToastComponent,
    LibrarianDashboardComponent,
    LibrarianBooksComponent,
    LibrarianMembersComponent,
    LibrarianRequestsComponent,
    LibrarianReportsComponent,
    LibrarianMailLogComponent,
    MemberDashboardComponent,
    MemberBrowseComponent,
    MemberMyRequestsComponent,

    MemberReportsComponent,
    MemberMembershipComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    ReminderSchedulerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
