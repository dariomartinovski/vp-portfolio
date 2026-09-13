import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { WorkPage } from './pages/work/work.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'Your Name — Digital Illustrator & Designer',
  },
  {
    // WorkPage is `standalone: false`, so it can be neither `loadComponent`
    // (standalone only) nor `loadChildren` (NgModule only). Eager import until
    // the standalone decision is made.
    path: 'work',
    component: WorkPage,
    title: 'Work — Your Name',
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top', // scroll to top on route change
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
