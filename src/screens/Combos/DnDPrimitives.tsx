import React, { PropsWithChildren } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
    useDraggable,
    useDroppable,
    type UseDraggableOptions,
    type UseDroppableOptions,
} from '@mgcrea/react-native-dnd';

export type StyleWorklet<T extends boolean> = (
    style: Record<string, any>,
    flag: T
) => Record<string, any>;

export type DnDDraggableProps = PropsWithChildren<
    UseDraggableOptions & {
        style?: any;
        animatedStyleWorklet?: StyleWorklet<boolean>;
    }
>;

export const DnDDraggable: React.FC<DnDDraggableProps> = ({
    id,
    data,
    disabled,
    style,
    animatedStyleWorklet,
    children,
}) => {
    const { props: dragProps, activeId } = useDraggable({ id, data, disabled });

    const aStyle = useAnimatedStyle(() => {
        'worklet';
        const isActive = activeId.value === id;
        let s: Record<string, any> = {};
        if (animatedStyleWorklet) s = animatedStyleWorklet(s, isActive);
        return s;
    }, [id]);

    return (
        <Animated.View {...(dragProps as any)} style={[style, aStyle]}>
            {children}
        </Animated.View>
    );
};

export type DnDDroppableProps = PropsWithChildren<
    UseDroppableOptions & {
    style?: any;
    animatedStyleWorklet?: StyleWorklet<boolean>;
}
>;

export const DnDDroppable: React.FC<DnDDroppableProps> = ({
  id,
  data,
  disabled,
  style,
  animatedStyleWorklet,
  children,
}) => {
    const { props: dropProps, activeId } = useDroppable({ id, data, disabled });

    const aStyle = useAnimatedStyle(() => {
        "worklet";
        const isOver = activeId.value === id;
        const base = {};
        return animatedStyleWorklet ? animatedStyleWorklet(base, isOver) : base;
    }, [id]);

    return (
        <Animated.View {...(dropProps as any)} style={[style, aStyle]}>
            {children}
        </Animated.View>
    );
};