import React from 'react'
import {createStackNavigator} from 'react-navigation-stack'
import DonateScreen from '../screens/DonateScreen'
import RecvDetailsScreen from '../screens/RecvDetailsScreen'
export const AppStackNavigator = createStackNavigator({
    BookDonateList:{
        screen:DonateScreen,
        navigationOptions:{
            headerShown:false
        }
    },
    BookRecverDetails:{
        screen:RecvDetailsScreen,
        navigationOptions:{
            headerShown:false
        }
    },
},
    {
        initialRouteName:'BookDonateList'
    }
)