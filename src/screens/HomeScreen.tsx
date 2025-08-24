import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import {colors} from "../theme/theme";
import T from "../theme/T";

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, { padding: 16 }]}>
                <T style={{ fontSize: 60, color: colors.text }}>BOX XP+</T>
            </View>
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
