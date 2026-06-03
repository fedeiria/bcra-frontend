import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Header } from "../../shared/components/header/header";
import { Footer } from "../../shared/components/footer/footer";

@Component({
  selector: 'app-transparency',
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './transparency.html',
  styleUrl: './transparency.scss',
})
export class Transparency {

}
