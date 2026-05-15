import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ConsultationService } from '../../core/services/consultation-service';
import { Spinner } from "../../shared/components/spinner/spinner";

import { IApiResponse } from '../../models/interfaces/iapi-response';
import { ICreditSummary } from '../../models/interfaces/icredit-summary';
import { Header } from "../../shared/components/header/header";

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, Spinner, Header],
  templateUrl: './consultation.html',
  styleUrl: './consultation.scss',
})
export class Consultation {

  cuit: string = '';
  loading: boolean = false;
  result: ICreditSummary | null = null;
  errorMessage: string | null = null;

  constructor(private consultationService: ConsultationService) { }

  consult() {

    if (!this.isValidCuit()) {
      this.errorMessage = 'Formato de CUIT inválido';
      return;
    }

    this.loading = true;
    this.result = null;
    this.errorMessage = null;

    this.consultationService.getSummary(this.cuit)
      .subscribe({
        next: (response: IApiResponse<ICreditSummary>) => {

          if (response.error) {
            this.errorMessage = response.message || 'Error al consultar';
            this.loading = false;
            return;
          }

          this.result = response.data ?? null;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Error de conexión con el servidor';
          this.loading = false;
        }
      });
  }

  /**
   * Gets the CSS class for the situation based on its value
   * @param situacion The situation value
   * @returns The corresponding CSS class
   */
  getSituationClass(situation: number): string {
    return `situacion-${situation}`;
  }

  /**
   * Handles the input event for the CUIT field
   * @param event The input event
   */
  onCuitInput(event: Event) {
    const input = event.target as HTMLInputElement;

    // remove everything that is not a number
    let value = input.value.replace(/\D/g, '');

    // limit to 11 digits
    value = value.slice(0, 11);

    // update model + input
    this.cuit = value;
  }

  /**
   * Validates if the CUIT is in the correct format
   * @returns True if the CUIT is valid, false otherwise
   */
  isValidCuit(): boolean {
    return /^\d{11}$/.test(this.cuit);
  }
}
