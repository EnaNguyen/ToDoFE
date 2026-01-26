import { Component, Injectable, CUSTOM_ELEMENTS_SCHEMA, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItem } from './to-do.store';
import { TodoStore } from './to-do.store';
import { ToDoUpdateModal } from './to-do.update';
@Component({
  selector: 'list-to-do',
  standalone: true,
  imports: [CommonModule, ToDoUpdateModal],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <table class="table-fixed">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>User</th>
          <th>Description</th>
          <th>Status</th>
          <th>Create At</th>
          <th>Due At</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let item of toDoItems; let i = index">
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.fullName }}</td>
          <td>{{ item.description }}</td>
          <td>{{ item.isCompleted ? 'Hoàn thành' : 'Chưa xong' }}</td>
          <td>{{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
          <td>{{ item.dueDate | date: 'dd/MM/yyyy HH:mm' }}</td>
          <td>
            <div class="relative inline-block">
              <button
                (click)="toggleDropdown(i)"
                class="inline-flex items-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="More actions"
              >
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </button>

              <div
                *ngIf="openDropdownIndex === i"
                class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-white/10 rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 z-10"
              >
                <button
                  class="py-1"
                  href="#"
                  command="show-modal"
                  commandfor="updateModal"
                  class="block px-4 py-2 text-sm text-gray-300
                hover:bg-white/5 hover:text-white w-full"
                  (click)="openUpdateModal(item, $event)"
                >
                  Edit
                </button>
                <button
                  class="block w-full px-4 py-1 text-sm text-gray-300 hover:bg-white/5 hover:text-white text-left"
                  (click)="onChangeStatus(item, $event)"
                >
                  {{ item.isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành' }}
                </button>
                <button
                  class="py-1"
                  href="#"
                  (click)="onDelete(item, $event)"
                  class="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
        <tr *ngIf="isLoading">
          <td colspan="8" class="text-center py-4">Đang tải...</td>
        </tr>
        <tr *ngIf="!isLoading && toDoItems.length === 0">
          <td colspan="8" class="text-center py-4">Chưa có công việc nào</td>
        </tr>
      </tbody>
    </table>
    <update-to-do-modal [selectedItem]="selectedToDo" />`,
})
export class ToDoListTable {
  @Input() toDoItems: TodoItem[] = [];
  @Input() isLoading: boolean = false;
  selectedToDo: TodoItem | null = null;
  openDropdownIndex: number | null = null;
  private readonly toDoStore = inject(TodoStore);
  toggleDropdown(index: number) {
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }
  onDelete(item: TodoItem, event: Event) {
    event.preventDefault();
    this.toDoStore.RemoveToDo(item.id);
  }
  openUpdateModal(item: TodoItem, event: Event) {
    event.stopPropagation();
    this.selectedToDo = item;
  }
  onChangeStatus(item: TodoItem, event: Event)
  {
    event.preventDefault();
    this.toDoStore
  };
}
