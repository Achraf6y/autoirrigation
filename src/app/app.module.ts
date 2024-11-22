import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideFirebaseApp(() => initializeApp({"projectId":"autoirrigation-527b3","appId":"1:26989803428:web:ac58eecc535e32b63fb331","databaseURL":"https://autoirrigation-527b3-default-rtdb.europe-west1.firebasedatabase.app","storageBucket":"autoirrigation-527b3.firebasestorage.app","apiKey":"AIzaSyDwOlP7TdPZEbp31fNG4ink7TDcDn6fHCw","authDomain":"autoirrigation-527b3.firebaseapp.com","messagingSenderId":"26989803428","measurementId":"G-QZWJJ5DL6G"})),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
