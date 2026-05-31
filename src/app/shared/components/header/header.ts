import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  isMenuOpen = false;

  /**
   * Switch the state of the menu between open and closed.
   * This method is called when the user clicks on the menu toggle button.
   * It toggles the value of `isMenuOpen`, which controls the visibility of the menu.
   * @returns void
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Close the menu by setting `isMenuOpen` to false.
   * This method is called when the user clicks on a menu item or outside the menu.
   * It ensures that the menu is closed after an interaction.
   * @returns void
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}