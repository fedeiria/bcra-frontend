import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ICheckDetail } from '../../../../models/interfaces/icheck-detail';
import { getCheckStatusConfig } from '../../../../shared/utils/credit-formatters';

@Component({
  selector: 'app-rejected-checks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rejected-checks.html',
  styleUrl: './rejected-checks.scss',
})
export class RejectedChecks {

  @Input({ required: true }) checks: ICheckDetail[] = [];

  /**
   * Get the status of the check from method getCheckStatusConfig
   */
  getCheckStatusConfig = getCheckStatusConfig;
}