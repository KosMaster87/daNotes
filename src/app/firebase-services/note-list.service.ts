import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Observable } from 'rxjs';

import {
  query,
  where,
  limit,
  orderBy,
  Firestore,
  collectionData,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from '@angular/fire/firestore';
// import { Console } from 'console';
// import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalNotes_Marked: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubNotesMarked;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNoteslList();
    this.unsubNotesMarked = this.subNotesListMarked();
    this.unsubTrash = this.subTrashList();
  }
  // ----------------------

  // // Neue Methode um Subkollektionen abzurufen
  // async getSubcollectionData(parentId: string) {
  //   const parentDocRef = doc(this.firestore, 'notes', parentId);
  //   const subColRef = collection(parentDocRef, 'subKos'); // Setze den Namen der Subkollektion
  //   const subColSnapshot = await getDocs(subColRef);
  //   subColSnapshot.forEach((doc) => {
  //     console.log(doc.id, ' => ', doc.data());
  //   });
  // }

  // // Methode um alle Subkollektionen rekursiv abzurufen
  // async getAllSubcollections(parentRef: any) {
  //   const subColRef = collection(parentRef, 'subKos'); // Setze den Namen der Subkollektion
  //   const subColSnapshot = await getDocs(subColRef);

  //   subColSnapshot.forEach((doc) => {
  //     console.log(doc.id, ' => ', doc.data());
  //     // Rekursion für weitere Subkollektionen
  //     this.getAllSubcollections(doc.ref);
  //   });
  // }

  // // ----------------------

  // loadSubcollection(parentId: string) {
  //   this.noteListService
  //     .getSubcollectionData(parentId)
  //     .then(() => {
  //       console.log('Subkollektionen wurden geladen.');
  //     })
  //     .catch((error) => {
  //       console.error('Fehler beim Laden der Subkollektionen: ', error);
  //     });
  // }

  // loadAllSubcollections(parentId: string) {
  //   const parentDocRef = this.noteListService.getSingelDocRef(
  //     'notes',
  //     parentId
  //   );
  //   this.noteListService
  //     .getAllSubcollections(parentDocRef)
  //     .then(() => {
  //       console.log('Alle Subkollektionen wurden geladen.');
  //     })
  //     .catch((error) => {
  //       console.error('Fehler beim Laden aller Subkollektionen: ', error);
  //     });
  // }

  // ----------------------

  subNoteslList() {
    let ref = collection(this.firestore, '/notes/6lzWqfosKjR2OupdBWP1/subKos/');

    const q = query(
      // ref,
      this.getNotesRef(),
      // where('marked', '==', false),
      // orderBy('title'),
      // limit(100)
    );
    return onSnapshot(
      q,
      (list) => {
        this.normalNotes = [];
        list.forEach((element) => {
          this.normalNotes.push(this.setNoteObject(element.data(), element.id));
        });

        list.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('New note: ', change.doc.data());
          }
          if (change.type === 'modified') {
            console.log('Modified note: ', change.doc.data());
          }
          if (change.type === 'removed') {
            console.log('Removed note: ', change.doc.data());
          }
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
  // ----------------------
  subNotesListMarked() {
    const q = query(
      this.getNotesRef(),
      where('marked', '==', true),
      limit(100)
    );
    return onSnapshot(q, (list) => {
      this.normalNotes_Marked = [];
      list.forEach((element) => {
        this.normalNotes_Marked.push(
          this.setNoteObject(element.data(), element.id)
        );
      });
    });
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  // -----------------------------------------------

  async addNote(item: Note, colId: 'notes' | 'trash') {
    if (colId == 'notes') {
      await addDoc(this.getNotesRef(), item)
        .catch((err) => {
          console.error(err);
        })
        .then((docRef) => {
          console.log('Document written with ID: ', docRef);
        });
    } else {
      await addDoc(this.getTrashRef(), item);
    }
  }

  async updateNote(note: Note) {
    const colId = this.getColIdFromNote(note);
    if (note.id && colId) {
      let docRef = this.getSingelDocRef(colId, note.id);

      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        await updateDoc(docRef, this.getCleanJson(note)).catch((err) => {
          console.error('Fehler beim Aktualisieren des Dokuments: ', err);
        });
      } else {
        console.error(
          `Dokument mit ID ${note.id} in Sammlung ${colId} existiert nicht`
        );
      }
    }
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingelDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  // -----------------------------------------------

  ngOnDestroy() {
    this.subNoteslList();
    this.subTrashList();
    this.subNotesListMarked();
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingelDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      description: obj.description || '',
      marked: obj.marked || false,
    };
  }

  getColIdFromNote(note: Note): string {
    if (note.type == 'note') {
      return 'notes';
    }
    return 'trash';
    // return 'trash';
    // return 'defaultCollection';
  }

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      description: note.description,
      marked: note.marked,
    };
  }
}

// ngonDestroy() Lifecycle-Hook in Angular, die in den Lebenszyklus einer Komponente oder Direktive eingebunden sind.
// Unsubscribe von Observables , Event-Listener entfernen,
// Andere manuelle Aufräumarbeiten wie: setTimeout, setInterval oder benutzerdefinierte Objekte gehören.
// Es wird aufgerufen, wenn eine Komponente aus dem DOM entfernt wird.
