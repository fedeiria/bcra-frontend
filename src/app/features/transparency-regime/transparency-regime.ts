import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Header } from "../../shared/components/header/header";
import { Footer } from "../../shared/components/footer/footer";

@Component({
  selector: 'app-transparency-regime',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './transparency-regime.html',
  styleUrl: './transparency-regime.scss',
})
export class TransparencyRegime {

}
