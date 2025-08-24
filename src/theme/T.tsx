import React from 'react';
import { Text } from "react-native";


type Props = React.ComponentProps<typeof Text>;

export default function T(props: Props) {
    return (<Text {...props} style={[{ fontFamily: 'FugazOne' }, props.style]} />);
}