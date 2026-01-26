import { Component, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthServices } from '../../../services/AuthServices';
import { Router } from '@angular/router';
import { TodoItem } from '../../admins/to-do/to-do-store';
import { ToDoStoreUser } from './to-do.store';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TodoStore } from '../../admins/to-do/to-do-store';
import { ToDoCreateModalUser } from './to-do.create';
@Injectable()
@Component({
  selector: 'app-to-do',
  imports: [CommonModule, ToDoCreateModalUser],
  templateUrl: './to-do.html',
  styleUrl: './to-do.scss',
  providers: [ToDoStoreUser, TodoStore],
})
export class ToDoUser {
  private readonly toDoStoreUser = inject(ToDoStoreUser);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ToDoStore = inject(TodoStore);
  readonly toDoItems$ = this.toDoStoreUser.toDoList$;
  openDropdownId: number | null = null;
  constructor() {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userInfo = localStorage.getItem('userData');
      if (userInfo) {
        const userId = JSON.parse(userInfo).username;
        this.toDoStoreUser.loadToDoList(userId);
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
    this.toDoStoreUser.completeToDo(item);
  }

  onEdit(item: any) {
    this.ToDoStore.UpdateToDo(item);
  }

  onDelete(item: any) {
    this.ToDoStore.RemoveToDo(item);

  }
}
