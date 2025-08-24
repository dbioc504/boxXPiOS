import React from 'react';
import {Pressable, Text, View} from "react-native";
import { sharedStyle } from "./theme";
import {useNavigation, useRoute} from "@react-navigation/native";
import Logo from '../../assets/bxpLogo.svg'

type Props = React.ComponentProps<typeof Text>;

export default function T(props: Props) {
    return (<Text {...props} style={[{ fontFamily: 'FugazOne' }, props.style]} />);
}

export function Header({ title }: { title: string }) {
    const nav = useNavigation<any>();
    const route = useRoute();
    const isHome = route.name === 'Home';

    return (
        <View style={sharedStyle.headerRow}>
            <Pressable
                onPress={() => { if (!isHome) nav.navigate('Home'); }}
                disabled={isHome}
                style={sharedStyle.headerLeft}
                hitSlop={8}
            >
                <Logo width={70} height={70} />
            </Pressable>

            <View style={sharedStyle.headerCenter}>
                <T
                    style={sharedStyle.headerTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                >
                {title}
                </T>
            </View>

            <View style={sharedStyle.headerRight}/>
        </View>
    )
}