import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ICreditSummary } from '../../../../models/interfaces/icredit-summary';
import { getSituationClass, getSituationLabel } from '../../../../shared/utils/credit-formatters.util';

@Component({
  selector: 'app-metric-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-cards.html',
  styleUrl: './metric-cards.scss',
})
export class MetricCards {
  @Input({ required: true }) summary!: ICreditSummary;

  /**
   * Get total debt of the CUIT
   */
  get totalDebt(): number {
    return this.summary?.deudaTotal ?? 0;
  }

  /**
   * Get the situation of the CUIT
   */
  get situation(): number {
    return this.summary?.situacion ?? 0;
  }

  /**
   * Get the situation class from method getSituationClass
   */
  getSituationClass = getSituationClass;
  
  /**
   * Get the situation label from method getSituationLabel
   */
  getSituationLabel = getSituationLabel;
}