export interface ToDoView 
{
   id: number,
   title: string,
   fullName: string,
   description: string,
   isCompleted: boolean,
   createdAt: string,
   dueDate: string
}
export interface CreateToDo
{
    title: string,
    description: string,
    userId : number,
    dueDate: string
}
export interface UpdateToDo{
    title: string,
    description: string,
    dueDate: string
    id: number
}