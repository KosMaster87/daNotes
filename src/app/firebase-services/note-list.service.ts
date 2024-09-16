import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Observable } from 'rxjs';

import {
  Firestore,
  collectionData,
  collection,
  doc,
  onSnapshot,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNote: Note[] = [];

  items$;
  items;

  unsubList;
  unsubSingle;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubList = onSnapshot(this.getNotesRef(), (list) => {
      list.forEach((element) => {
        console.log(element);
      });
    });

    this.unsubSingle = onSnapshot(
      this.getSingelDocRef('notes', '345345345kl345kl34h5'),
      (element) => {}
    );
    this.unsubSingle();
    this.unsubList();

    // this.items$ = collectionData(this.getNotesRef());

    this.items$ = collectionData(this.getNotesRef());
    this.items = this.items$.subscribe((list) => {
      list.forEach((element) => {
        console.log(element);
      });
    });
    this.items.unsubscribe();
  }

  // const itemCollection = collection(this.firestore, 'items');
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }
  getTrashRef() {
    return collection(this.firestore, 'trash');
  }
  getSingelDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
