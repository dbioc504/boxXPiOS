import  React from 'react';
import { View } from "react-native";
import { Droppable } from "@mgcrea/react-native-dnd";

type Props = {
    count: number;
    onInsert: (index: number) => void;
}

export function TimelineSlots({ count, onInsert }: Props) {
    return (
        <View style={{ flexDirection: 'row', padding: 12 }}>
            {Array.from({ length: count }).map((_, i) => (
              <Droppable key={`slot-${i}`} id={`slot-${i}`} data={{ index: i }}>
                  <View
                      style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          marginRight: 8,
                          backgroundColor: '#0f172a22',
                          borderWidth: 1,
                          borderColor: '#334155'
                      }}
                  />
              </Droppable>
            ))}
        </View>
    );
}
