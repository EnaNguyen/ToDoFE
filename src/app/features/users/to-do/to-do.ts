import { Component, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthServices } from '../../../services/AuthServices';
import { Router } from '@angular/router';
import { TodoItem } from '../../admins/to-do/to-do-store';
import { ToDoStore } from './to-do.store';
import { CommonModule, isPlatformBrowser } from '@angular/common';
@Injectable()
@Component({
  selector: 'app-to-do',
  imports: [CommonModule],
  templateUrl: './to-do.html',
  styleUrl: './to-do.scss',
  providers: [ToDoStore],
})
export class ToDoUser {
  private readonly toDoStore = inject(ToDoStore);
  private readonly platformId = inject(PLATFORM_ID);
  readonly toDoItems$ = this.toDoStore.toDoList$;
  openDropdownId: number | null = null;
  constructor() {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userInfo = localStorage.getItem('userData');
      if (userInfo) {
        const userId = JSON.parse(userInfo).username;
        this.toDoStore.loadToDoList(userId);
      }
    }
  }
  toggleDropdown(id: number) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  onComplete(item: any) {
    this.toDoStore.completeToDo(item);
  }

  onEdit(item: any) {
    console.log('Edit:', item);
  }

  onDelete(item: any) {
    console.log('Delete:', item);

  }
}
