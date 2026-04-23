import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserList } from './users/components/user-list/user-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
