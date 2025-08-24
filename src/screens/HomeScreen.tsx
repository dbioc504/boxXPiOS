import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import {colors} from "../theme/theme";
import {Header} from "../theme/T";

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <Header title={"BOX XP+"}/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
        flexDirection: 'column',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
