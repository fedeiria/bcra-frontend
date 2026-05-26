import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChecksService } from '../../core/services/checks/checks-service';
import { IBankEntity } from '../../models/interfaces/ibank-entity';
import { IReportedCheck } from '../../models/interfaces/ireportedcheck';

import { Header } from "../../shared/components/header/header";

@Component({
  selector: 'app-check-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './check-consultation.html',
  styleUrl: './check-consultation.scss',
})
export class ChecksConsultation implements OnInit {
  // Form
  selectedBankCode: string = '';
  checkNumber: string = '';
  
  // Data and states
  banks: IBankEntity[] = [];
  result: IReportedCheck | null = null;
  
  loadingBanks: boolean = false;
  loadingQuery: boolean = false;
  errorMessage: string | null = null;

  constructor(private checksService: ChecksService) {}

  ngOnInit(): void {
    this.loadBankingEntities();
  }

  /**
   * Load the list of entities when initializing the component.
   * @returns void.
   */
  private loadBankingEntities(): void {
    this.loadingBanks = true;
    this.checksService.getBankingEntities().subscribe({
      next: (res) => {
        if (!res.error && res.data) {
          this.banks = res.data;
        }
        else {
          this.errorMessage = 'No se pudo cargar la lista de bancos.';
        }
        this.loadingBanks = false;
      },
      error: (err) => {
        console.error('Error de conexión:', err);
        this.errorMessage = 'Error de conexión al obtener entidades.';
        this.loadingBanks = false;
      }
    });
  }

  /**
   * Executes the query checks.
   * @returns void.
   */
  consultReportedCheck(): void {
    if (!this.selectedBankCode || !this.checkNumber) {
      this.errorMessage = 'Por favor, seleccione un banco e ingrese el número de cheque.';
      return;
    }

    this.loadingQuery = true;
    this.errorMessage = null;
    this.result = null;

    this.checksService.searchCheck(this.selectedBankCode, this.checkNumber).subscribe({
      next: (res) => {
        if (!res.error && res.data) {
          this.result = res.data;
          this.checkNumber = '';
        }
        else {
          this.errorMessage = res.message || 'Error al consultar el cheque.';
        }
        this.loadingQuery = false;
      },
      error: () => {
        this.errorMessage = 'Error de comunicación con el servidor.';
        this.loadingQuery = false;
      }
    });
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