import { NgModule } from '@angular/core';
import { Routes ,RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { Login2PageComponent } from './pages/login2-page/login2-page.component';

export const routes: Routes = [

  { path: '', component: HomeComponent, title: 'Home' },
  { path: 'login', component: LoginPageComponent, title: 'Login' },
  { path: 'login2', component:Login2PageComponent, title: 'Login2' },
  { path: 'login3', component: LoginPageComponent, title: 'Login3' },
  { path: 'login4', component: LoginPageComponent, title: 'Login4' }




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
