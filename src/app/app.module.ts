import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { OrgTreeContainerComponent } from './containers/org-tree-container/org-tree-container.component';
import { OrgTreeTitleComponent } from './components/org-tree/org-tree-title/org-tree-title.component';
import { OrgTreeMainComponent } from './components/org-tree/org-tree-main/org-tree-main.component';

import { CONFIG } from '../app-config';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppAppContainerComponent } from './containers/app-app-container/app-app-container.component';

@NgModule({
  declarations: [
    AppComponent,
    OrgTreeContainerComponent,
    OrgTreeTitleComponent,
    OrgTreeMainComponent,
    AppAppContainerComponent
  ],
  imports: [
   BrowserModule,
		ReactiveFormsModule,
		FormsModule,
		SharedModule,
		   CoreModule.forRoot({
      ...CONFIG,
      logger: { level: 'debug' } // dynamically set logging level
	  })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
