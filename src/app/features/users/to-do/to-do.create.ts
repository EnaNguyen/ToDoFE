import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateToDo } from './models/to-do.model';
import { ToDoStoreUser } from './to-do.store';
import { TodoStore } from '../../admins/to-do/to-do-store';
@Component({
    selector :'create-to-do-modal-user',
    imports: [ReactiveFormsModule, CommonModule, FormsModule],
    template: `<el-dialog>
    <dialog
      id="createModal"
      aria-labelledby="dialog-title"
      class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
    >
      <el-dialog-backdrop
        class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      ></el-dialog-backdrop>

      <div
        tabindex="0"
        class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0"
      >
        <el-dialog-panel
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg xl:max-w-[1200px] data-closed:sm:translate-y-0 data-closed:sm:scale-95"
        >
          <form [formGroup]="ToDoCreateForm" (ngSubmit)="onSubmit()">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h1 id="dialog-title" class="text-base font-semibold text-gray-900">
                    Create a new To Do
                  </h1>
                  <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 p-4">
                    <div class="p-6 rounded-xl shadow">
                      <p>Tiêu đề</p>
                      <input
                        type="text"
                        class="max-w-[400px] bg-white focus:bg-grey-100 focus:shadown-xl p-2 pl-4"
                        id="title"
                        formControlName="title"
                      />
                      <p>Description</p>
                      <input
                        type="text"
                        class="max-w-[400px] bg-white focus:bg-grey-100 focus:shadown-xl p-2 pl-4"
                        id="description"
                        formControlName="description"
                      />
                    </div>
                    <div class="p-6 rounded-xl shadow">
                      <p>Due Date</p>
                      <input
                        type="date"
                        [min]="minDateToday"
                        class="max-w-[400px] bg-white focus:bg-grey-100 focus:shadown-xl p-2 pl-4"
                        id="dueDate"
                        formControlName="dueDate"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                command="close"
                commandfor="createModal"
                class="inline-flex w-full justify-center rounded-md bg-green-300 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto"
              >
                Create
              </button>
              <button
                type="button"
                command="close"
                commandfor="createModal"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </el-dialog-panel>
      </div>
    </dialog>
  </el-dialog>`
})     