import { Observable, switchMap, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ComponentStore } from '@ngrx/component-store';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ToDoView } from '../../admins/to-do/models/to-do.model';
export interface ToDoUserInfo {
   id: number,
   title: string,
   fullName: string,
   description: string,
   isCompleted: boolean,
   createdAt: string,
   dueDate: string
}
export interface ToDoState {
  toDoList: ToDoUserInfo[];
  isLoading: boolean;
  error: string | null;
}
const initialState: ToDoState = {
  toDoList: [],
  isLoading: false,
  error: null,
};
@Injectable()
export class ToDoStoreUser extends ComponentStore<ToDoState> {
  constructor() {
    super(initialState);
  }
  private readonly http = inject(HttpClient);
  readonly toDoList$: Observable<ToDoUserInfo[]> = this.select((state) => state.toDoList);
  readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
  readonly error$: Observable<string | null> = this.select((state) => state.error);
  readonly setToDoList = this.updater((state, toDoList: ToDoUserInfo[]) => ({
    ...state,
    toDoList,
    isLoading: false,
    error: null,
  }));
  readonly finishToDo = this.updater((state, toDoItem: ToDoUserInfo) => {
    const updatedList = state.toDoList.map(item =>
      item.id === toDoItem.id ? { ...item, isCompleted: true } : item   
    );
    return { ...state, toDoList: updatedList };
  });
  readonly loadToDoList = this.effect<string>((trigger$) =>
    trigger$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((trigger) =>
        this.http
          .get<ToDoUserInfo[]>(`${environment.apiUrl}/todo/${trigger}`, {
            withCredentials: true,
          })
          .pipe(
            tap((response: ToDoUserInfo[]) => {
              console.log(response);
              this.setToDoList(response);
            }),
            tap(() => this.patchState({ isLoading: false })),
            catchError((error) => {
              this.patchState({ isLoading: false, error: error.message });
              return of();
            }),
          ),
      ),
    ),
  );
  readonly completeToDo = this.effect<ToDoUserInfo>((toDoItem$) =>
    toDoItem$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((toDoItem) =>
        this.http.put<ToDoView>(`${environment.apiUrl}/todo/complete/${toDoItem.id}`, { isCompleted: true }, {
          withCredentials: true,
        }).pipe(
          tap(() => {
            this.finishToDo(toDoItem);
          }),
          tap(() => this.patchState({ isLoading: false })),
          catchError((error) => {
            this.patchState({ isLoading: false, error: error.message });
            return of();
          }),
        ),
      ),
    ),
  );
}