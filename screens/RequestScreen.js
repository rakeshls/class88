import React,{Component} from 'react';
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity
  } from 'react-native';
  import db from '../config';
  import firebase from 'firebase';
  import MyHeader from '../components/MyHeader'
  import {BookSearch} from 'react-native-google-books'
import { TouchableHighlight } from 'react-native-gesture-handler';
  
  export default class RequestScreen extends Component{
    constructor(){
      super();
      this.state ={
        userId : firebase.auth().currentUser.email,
        bookName:"",
        reasonToRequest:"",
        requestid:'',
        IsBookRequestActive:'',
        requestedBookName:'',
        bookStatus:'',
        userDocId:'',
        docId:'',
        dataSource:'',
        showFlatList:false
      }
    }
  
    createUniqueId(){
      return Math.random().toString(36).substring(7);
    }
  
  
  
    addRequest =async (bookName,reasonToRequest)=>{
      var userId = this.state.userId
      alert(userId)
      var randomRequestId = this.createUniqueId()
      db.collection('requested_books').add({
          "user_id": userId,
          "book_name":bookName,
          "reason_to_request":reasonToRequest,
          "request_id"  : randomRequestId,
          "book_status" : 'requested',
          "date":firebase.firestore.FieldValue.serverTimestamp()
      })
      await this.getBookRequest()
      db.collection('Users').where("EmailId","==",userId).get()
      .then()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          db.collection('Users').doc(doc.id).update({
        IsBookRequestActive: true
        })
      })
    })
      this.setState({
          bookName :'',
          reasonToRequest : '',
          requestid:randomRequestId
      })
  
      return alert("Book Requested Successfully")
    }
  
    receivedBooks=(bookName)=>{
      var userId = this.state.userId
      var requestId = this.state.requestId
      db.collection('received_books').add({
          "user_id": userId,
          "book_name":bookName,
          "request_id"  : requestId,
          "bookStatus"  : "received",
    
      })
    }
    getIsBookRequestActive(){
      db.collection('Users')
      .where('EmailId','==',this.state.userId)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            IsBookRequestActive:doc.data().IsBookRequestActive,
            userDocId : doc.id
          })
        })
      })
    }
    getBookRequest =()=>{
      // getting the requested book
    var bookRequest=  db.collection('requested_books')
      .where('user_id','==',this.state.userId)
      .get()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          if(doc.data().book_status !== "received"){
            this.setState({
              requestId : doc.data().request_id,
              requestedBookName: doc.data().book_name,
              bookStatus:doc.data().book_status,
              docId     : doc.id
            })
          }
        })
    })}
    sendNotification=()=>{
      //to get the first name and last name
      db.collection('Users').where('EmailId','==',this.state.userId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc)=>{
          var name = doc.data().first_name
          var lastName = doc.data().last_name
    
          // to get the donor id and book nam
          db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
          .then((snapshot)=>{
            snapshot.forEach((doc) => {
              var donorId  = doc.data().donor_id
              var bookName =  doc.data().book_name
    
              //targert user id is the donor id to send notification to the user
              db.collection('all_notifications').add({
                "targeted_user_id" : donorId,
                "message" : name +" " + lastName + " received the book " + bookName ,
                "notification_status" : "unread",
                "book_name" : bookName
              })
            })
          })
        })
      })
    }
   async getBooksFromApi(bookName){
     this.setState({
       bookName:bookName
      })
      if(bookName.length<2){
       var books= await BookSearch.searchbook(bookName,"AIzaSyC4-dBdWstVybmqxicbo9Qcr66MwrqsjR4")
       this.setState({
         dataSource:books.data,
         showFlatList:true
       })
      }
   }
    componentDidMount(){
      this.getBookRequest()
      this.getIsBookRequestActive()
    } 
    updateBookRequestStatus=()=>{
      //updating the book status after receiving the book
      db.collection('requested_books').doc(this.state.docId)
      .update({
        book_status : 'recieved'
      })
    
      //getting the  doc id to update the users doc
      db.collection('Users').where('EmailId','==',this.state.userId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc) => {
          //updating the doc
          db.collection('Users').doc(doc.id).update({
            IsBookRequestActive: false
          })
        })
      })
    
    
    }
    renderItem=({item,i})=>{
      return(
        <TouchableHighlight 
        style={{alignItems:'center',backgroundColor:'black',
        padding:10,width:'85%'}} activeOpacity={0.5}
        underlayColor='#dddddd'
        onPress={()=>{
          this.setState({
            showFlatList:false,
            bookName:item.volumeInfo.title
          })
        }}
        bottomDivier>
        <Text>{item.volumeInfo.title}</Text>
        </TouchableHighlight>
      )
    }
    render(){
      if(this.state.IsBookRequestActive === true){
      return(
        <View style = {{flex:1,justifyContent:'center'}}>
        <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
        <Text>Book Name</Text>
        <Text>{this.state.requestedBookName}</Text>
        </View>
        <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
        <Text> Book Status </Text>

        <Text>{this.state.bookStatus}</Text>
        </View>

        <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
        onPress={()=>{
          this.sendNotification()
          this.updateBookRequestStatus();
          this.receivedBooks(this.state.requestedBookName)
        }}>
        <Text>I recieved the book </Text>
        </TouchableOpacity>
      </View>
      )
    }
    else{
      return(
        <View style={{flex:1}}>
        <MyHeader title="Request Book" navigation={this.props.navigation}/>

          <KeyboardAvoidingView style={styles.keyBoardStyle}>
            <TextInput
              style ={styles.formTextInput}
              placeholder={"enter book name"}
              onChangeText={text => this.getBooksFromApi(text)}
              onClear={text => this.getBooksFromApi('')}
              value={this.state.bookName}
            />
              {  this.state.showFlatList ?

(  <FlatList
data={this.state.dataSource}
renderItem={this.renderItem}
enableEmptySections={true}
style={{ marginTop: 10 }}
keyExtractor={(item, index) => index.toString()}
/> )
:(
  <View>
            <TextInput
              style ={[styles.formTextInput,{height:300}]}
              multiline
              numberOfLines ={8}
              placeholder={"Why do you need the book"}
              onChangeText ={(text)=>{
                  this.setState({
                      reasonToRequest:text
                  })
              }}
              value ={this.state.reasonToRequest}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={()=>{ this.addRequest(this.state.bookName,this.state.reasonToRequest);
              }}
              >
              <Text>Request</Text>
            </TouchableOpacity>
           </View>
            )
            }
          </KeyboardAvoidingView>
      </View>
      )
      }
  }
  }
  
  const styles = StyleSheet.create({
    keyBoardStyle : {
      flex:1,
      alignItems:'center',
      justifyContent:'center'
    },
    formTextInput:{
      width:"75%",
      height:35,
      alignSelf:'center',
      borderColor:'#ffab91',
      borderRadius:10,
      borderWidth:1,
      marginTop:20,
      padding:10,
    },
    button:{
      width:"75%",
      height:50,
      justifyContent:'center',
      alignItems:'center',
      borderRadius:10,
      backgroundColor:"#ff5722",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 16,
      marginTop:20
      },
    }
  )
