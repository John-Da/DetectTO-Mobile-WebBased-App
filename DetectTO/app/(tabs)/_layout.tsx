import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const TabIcon = ({ focused, title}: any) => {
    if (focused){
        return (
            <View className='bg-[#AB8BFF] min-w-[128px] min-h-[53px] size-full justify-center items-center mt-4 rounded-full'>
                <Text className='text-base text-white font-semibold'>{title}</Text>
            </View>
        )
    }
    return (
        <View className='min-w-[128px] min-h-[53px] size-full justify-center items-center mt-4 rounded-full'>
            <Text className='text-base text-white'>{title}</Text>
        </View>
    )
}

const TabLayout = () => {
    return (
        <Tabs screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: {
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
            },
            tabBarStyle: {
                borderRadius: 50,
                backgroundColor: "#0f0D23",
                borderWidth: 1,
                borderColor: "#0f0D23",
                position: "absolute",
                marginHorizontal: 20,
                marginBottom: 36,
                height: 52,
                overflow: "hidden",

            }
        }}>
            <Tabs.Screen name='index' 
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} title="Home" />
                    ),
                }} 
            />

            <Tabs.Screen name='detection' options={{
                headerShown: false,
                title: "Detection",
                tabBarIcon: ({ focused }) => (
                    <TabIcon focused={focused} title="Detection"/>
                )
            }} />
            <Tabs.Screen name='saved' options={{
                headerShown: false,
                title: "Saved",
                tabBarIcon: ({ focused }) => (
                    <TabIcon focused={focused} title="Saved"/>
                )
            }} />
        </Tabs>
    )
}

export default TabLayout

const styles = StyleSheet.create({})