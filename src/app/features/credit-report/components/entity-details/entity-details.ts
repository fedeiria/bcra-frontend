import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { formatPeriod } from '../../../../shared/utils/date-formatters.util';
import { getSituationClass, getSituationLabel } from '../../../../shared/utils/credit-formatters.util';

import { IDebtEntityDetail } from '../../../../models/interfaces/idebt-entity-detail';

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-details.html',
  styleUrl: './entity-details.scss',
})
export class EntityDetails {

  @Input({ required: true }) details: IDebtEntityDetail[] = [];

  /**
   * Get the situation class from method getSituationClass
   */
  getSituationClass = getSituationClass;
  
  /**
   * Get the situation label from method getSituationLabel
   */
  getSituationLabel = getSituationLabel;

  formatPeriod = formatPeriod;
}