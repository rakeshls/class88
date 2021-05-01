import React, { Component} from 'react';
import { Header,Icon,Badge } from 'react-native-elements';
import { View, Text, StyeSheet ,Alert} from 'react-native';
import db from '../config'
export default class MyHeader extends Component {
  constructor(props){
 super(props)
 this.state={
   value:''
 }
  }
  bellIconBadge=()=>{
    return(
      <View>
        <Icon name='bell' type="font-awesome" color='yellow' onPress={()=>{
          this.props.navigation.navigate('Notification')
        }}>

        </Icon>
        <Badge value={this.state.value} containerStyle={{position:'absolute',top:-3,right:-3}}/>
      </View>
    )
  }
  getNumberOfUnReadNotification(){
    db.collection('all_notifications').where('notification_status','==','unread')
    .onSnapshot((snapshot)=>{
      var urn = snapshot.docs.map((doc)=>doc.data())
      this.setState({
        value:urn.length
      })
    })
  }
  componentDidMount(){
    this.getNumberOfUnReadNotification()
  }
  render(){
  return (
    <Header
    leftComponent={<Icon name="bars" type="font-awesome" color='blue' onPress={()=>{
      this.props.navigation.toggleDrawer()
    }} />}
      centerComponent={{ text: this.props.title, style: { color: '#90A5A9', fontSize:20,fontWeight:"bold", } }}
      rightComponent={<this.bellIconBadge{...this.props}/>}
      backgroundColor = "#eaf8fe"
    />
  );
  }
};
