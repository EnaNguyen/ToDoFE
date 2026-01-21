import { Component, Injectable, CUSTOM_ELEMENTS_SCHEMA, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'list-account',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <table>
      <thead>
        <tr>
            <th></th>
        </tr>
      </thead>
    </table>
  `,
})
export class AccountListTable {}
