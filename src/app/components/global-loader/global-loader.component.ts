
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { Component, inject } from '@angular/core';

import { Router, NavigationEnd } from '@angular/router';
import { map, startWith, combineLatest, filter } from 'rxjs'; // <--- Added 'filter' here
@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css'
})
export class GlobalLoaderComponent {
private router = inject(Router);
  private loadingService = inject(LoadingService);

  // List all URL segments where you don't want the loader to appear
  private excludedRoutes = ['/login', '/login2', '/login3', '/login4','/login5'];

  showLoader$ = combineLatest([
    this.loadingService.isLoading$,
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url)
    )
  ]).pipe(
    map(([isLoading, url]) => {
      // .some() checks if at least one excluded route is present in the current URL
      const isExcluded = this.excludedRoutes.some(route => url?.includes(route));

      return isLoading && !isExcluded;
    })
  );
}
