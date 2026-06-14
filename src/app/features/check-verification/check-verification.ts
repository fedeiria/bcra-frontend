import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CheckService } from '../../core/services/check/check-service';
import { IBankEntity } from '../../models/interfaces/ibank-entity';
import { IReportedCheck } from '../../models/interfaces/ireportedcheck';

import { Header } from "../../shared/components/header/header";
import { Footer } from '../../shared/components/footer/footer';
import { ExportService } from '../../core/services/export-data/export-service';

@Component({
  selector: 'app-check-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './check-verification.html',
  styleUrl: './check-verification.scss',
})
export class CheckVerification implements OnInit {
  // Form
  selectedBankCode: string = '';
  checkNumber: string = '';

  // Value to add in PDF
  lastQueriedNumber: string = '';
  
  // Data and states
  banks: IBankEntity[] = [];
  result: IReportedCheck | null = null;
  
  loadingBanks: boolean = false;
  loadingQuery: boolean = false;

  errorMessage = signal<string | null>(null);

  constructor(private checkService: CheckService, private exportService: ExportService) {}

  ngOnInit(): void {
    this.loadBankingEntities();
  }

  /**
   * Helper to handle http Error messages.
   * @param err Error response.
   * @param defaultMsg Default message.
   * @returns String with the error message.
   */
  private extractErrorMessage(err: HttpErrorResponse, defaultMsg: string): string {
    const backendMsg = err.error?.message;
    if (!backendMsg) return defaultMsg;
    
    return Array.isArray(backendMsg) ? backendMsg[0] : backendMsg;
  }

  /**
   * Load the list of entities when initializing the component.
   * @returns void.
   */
  private loadBankingEntities(): void {
    this.errorMessage.set(null);
    this.loadingBanks = true;

    this.checkService.getBankingEntities().subscribe({
      next: (bancos) => {
        this.banks = bancos;
        this.loadingBanks = false;
      },
      error: (err: HttpErrorResponse) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          const msg = this.extractErrorMessage(err, 'Se produjo un error al obtener las entidades bancarias.');
          this.errorMessage.set(msg);
        }

        this.loadingBanks = false;
        console.error('Error cargando bancos: ', err);
      }
    });
  }

  /**
   * Executes the query checks.
   * @returns void.
   */
  consultReportedCheck(): void {
    if (!this.selectedBankCode || !this.checkNumber) {
      this.errorMessage.set('Por favor, seleccione un banco e ingrese el número de cheque.');
      return;
    }

    this.loadingQuery = true;
    this.errorMessage.set(null);
    this.result = null;

    this.checkService.searchCheck(this.selectedBankCode, this.checkNumber).subscribe({
      next: (checkData) => {
        this.result = checkData;
        this.lastQueriedNumber = this.checkNumber;
        this.checkNumber = '';
        this.loadingQuery = false;
      },
      error: (err: HttpErrorResponse) => {
        const msg = this.extractErrorMessage(err, 'Error al consultar el cheque.');
        this.errorMessage.set(msg);
        this.loadingQuery = false;
      }
    });
  }

  /**
   * Export data to PDF.
   * @returns void.
   */
  exportToPdf(): void {
    if (!this.result) return;

    const bank = this.banks.find(b => b.codigoEntidad == this.selectedBankCode);
    const bankName = bank ? bank.denominacion : 'Entidad no identificada';
    
    this.exportService.exportToPdfCheck(
      this.result.results.detalles,
      bankName,
      this.selectedBankCode,
      this.lastQueriedNumber
    );
  }

  /**
   * Check if the query button should be enabled.
   * @returns True or false.
   */
  get isFormValid(): boolean {
    return this.selectedBankCode.length > 0 && /^\d+$/.test(this.checkNumber);
  }

  /**
   * Prevents that user enter a alphabetic character.
   * @param event The keyboard event.
   * @returns True or false.
   */
  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}