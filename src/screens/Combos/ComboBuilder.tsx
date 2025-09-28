import {BodyText} from "@/theme/T";
import {Animated, PanResponder, Pressable, View} from "react-native";
import {useRef, useState} from "react";
import {Movement} from "@/types/common";

function ComboBuilder({ palette, steps, insertAt, moveTo }: {
    palette: Movement[]; steps: Movement[];
    insertAt: (m: Movement, at: number) => Promise<void>;
    moveTo: (from: number, to: number) => Promise<void>;
}) {
    const [ghost, setGhost] = useState<{m:Movement,x:number,y:number}|null>(null);
    const [insertIndex, setInsertIndex] = useState(-1);
    const timelineRef = useRef<View>(null);
    const [timelineRect, setRect] = useState<{y:number; h:number}>({y:0,h:0});
    const SLOT_H = 44;

    const onTimelineLayout = () => {
        timelineRef.current?.measure((_x,_y,_w,h,_px,py)=> setRect({ y: py, h }));
    };

    const insideTimeline = (y:number) => y >= timelineRect.y && y <= timelineRect.y + timelineRect.h;

    const nearestSlot = (y:number) => {
        let idx = steps.length;
        if (insideTimeline(y)) {
            const mids = Array.from({length: steps.length+1}, (_,i) =>
                timelineRect.y + i*SLOT_H + SLOT_H/2
            );
            let best = 0, dist = Infinity;
            mids.forEach((mid,i)=>{ const d=Math.abs(mid - y); if (d < dist){ dist=d; best=i; }});
            idx = best;
        }
        return idx;
    };

    const makeResponderFromPalette = (m: Movement) => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => setGhost({ m, x: g.moveX, y: g.moveY }),
        onPanResponderMove: (_, g) => {
            setGhost({ m, x: g.moveX, y: g.moveY });
            setInsertIndex(nearestSlot(g.moveY));
        },
        onPanResponderRelease: async (_, g) => {
            const idx = insideTimeline(g.moveY) ? nearestSlot(g.moveY) : -1;
            setGhost(null); setInsertIndex(-1);
            if (idx >= 0) await insertAt(m, idx);
        },
    });

    return (
        <View style={{flex:1}}>
            {/* palette */}
            <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                {palette.map((m) => {
                    const r = makeResponderFromPalette(m);
                    return (
                        <Pressable
                            key={m}
                            {...r.panHandlers}
                            hitSlop={{top:8,bottom:8,left:8,right:8}}
                            style={{paddingVertical:10,paddingHorizontal:14,borderRadius:18,backgroundColor:'#99f'}}
                        >
                            <BodyText>{m}</BodyText>
                        </Pressable>
                    );
                })}
            </View>

            {/* timeline */}
            <View ref={timelineRef} onLayout={onTimelineLayout} style={{marginTop:16,padding:12,borderWidth:1,borderRadius:12}}>
                {steps.map((m, i) => (
                    <View key={`${m}-${i}`} style={{height:SLOT_H, justifyContent:'center'}}>
                        <BodyText>{m}</BodyText>
                    </View>
                ))}
                {insertIndex >= 0 && (
                    <View pointerEvents="none" style={{position:'absolute', left:12, right:12, top: insertIndex*SLOT_H, height:2, backgroundColor:'#fff'}}/>
                )}
            </View>

            {/* ghost */}
            {ghost && (
                <Animated.View style={{position:'absolute', transform:[{translateX: ghost.x-24},{translateY: ghost.y-24}]}}>
                    <View style={{paddingVertical:10,paddingHorizontal:14,borderRadius:18,backgroundColor:'#ccf'}}>
                        <BodyText>{ghost.m}</BodyText>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}
