import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-gray-900">🚌 Bus Organizer</h1>
              </div>
              <div class="hidden md:block ml-10">
                <div class="flex items-baseline space-x-4">
                  <a
                    routerLink="/cars"
                    routerLinkActive="bg-blue-100 text-blue-700"
                    class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Cars
                  </a>
                  <a
                    routerLink="/employees"
                    routerLinkActive="bg-blue-100 text-blue-700"
                    class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Employees
                  </a>
                  <a
                    routerLink="/route-optimization"
                    routerLinkActive="bg-blue-100 text-blue-700"
                    class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    Route Optimization
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
              <button
                (click)="toggleMobileMenu()"
                class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    [class.hidden]="isMobileMenuOpen"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                  <path
                    [class.hidden]="!isMobileMenuOpen"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div [class.hidden]="!isMobileMenuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <a
              routerLink="/cars"
              routerLinkActive="bg-blue-100 text-blue-700"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              (click)="closeMobileMenu()"
            >
              Cars
            </a>
            <a
              routerLink="/employees"
              routerLinkActive="bg-blue-100 text-blue-700"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              (click)="closeMobileMenu()"
            >
              Employees
            </a>
            <a
              routerLink="/route-optimization"
              routerLinkActive="bg-blue-100 text-blue-700"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50"
              (click)="closeMobileMenu()"
            >
              Route Optimization
            </a>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 mt-12">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="text-center text-gray-500 text-sm">
            <p>&copy; 2025 Bus Organizer. Built with Angular 18 and .NET 8.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {
  title = "Bus Organizer"
  isMobileMenuOpen = false

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false
  }
}
