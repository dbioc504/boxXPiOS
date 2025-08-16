import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>BOX XP+</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#00008B',
        flexDirection: 'column',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'FugazOne',
        color: '#FFFF00',
        fontSize: 60,
    },
});
