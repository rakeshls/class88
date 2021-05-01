import firebase from 'firebase';
require('@firebase/firestore')

 // Your web app's Firebase configuration
 var firebaseConfig = {
  apiKey: "AIzaSyC4-dBdWstVybmqxicbo9Qcr66MwrqsjR4",
  authDomain: "booksanta-21021.firebaseapp.com",
  projectId: "booksanta-21021",
  storageBucket: "booksanta-21021.appspot.com",
  messagingSenderId: "662250027845",
  appId: "1:662250027845:web:e45572c13ad867eea55c2c"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase.firestore();
