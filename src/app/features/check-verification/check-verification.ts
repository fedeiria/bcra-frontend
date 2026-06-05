import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CheckService } from '../../core/services/check/check-service';
import { IBankEntity } from '../../models/interfaces/ibank-entity';
import { IReportedCheck } from '../../models/interfaces/ireportedcheck';

import { Header } from "../../shared/components/header/header";
import { Footer } from '../../shared/components/footer/footer';
import { ExportService } from '../../core/services/export/export-service';

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
   * Load the list of entities when initializing the component.
   * @returns void.
   */
  private loadBankingEntities(): void {
    this.errorMessage.set(null);
    this.loadingBanks = true;

    this.checkService.getBankingEntities().subscribe({
      next: (res) => {
        if (!res.error && res.data) {
          this.banks = res.data;
        }
        else {
          this.errorMessage.set('No se pudo cargar la lista de bancos.');
        }
        this.loadingBanks = false;
      },
      error: (err) => {
        if (!navigator.onLine) {
          this.errorMessage.set('Parece que no tenés conexión a internet. Verificá tu red y reintentá.');
        }
        else {
          this.errorMessage.set('Se produjo un error al intentar obtener las entidades bancarias. Por favor, inténtelo de nuevo más tarde.');
        }
        this.loadingBanks = false;
        console.error('credit-cards.ts: ', err);
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
      next: (res) => {
        if (!res.error && res.data) {
          this.result = res.data;
          this.lastQueriedNumber = this.checkNumber;
          this.checkNumber = '';
        }
        else {
          this.errorMessage.set(res.message || 'Error al consultar el cheque.');
        }
        this.loadingQuery = false;
      },
      error: () => {
        this.errorMessage.set('Error de comunicación con el servidor.');
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