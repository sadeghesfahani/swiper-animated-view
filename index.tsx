import React, {useEffect, useState} from "react";
import {Dimensions, StyleSheet, View, Image} from "react-native";
import {PanGestureHandler} from "react-native-gesture-handler";
import HomePageInterface from "./interface";
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    useAnimatedGestureHandler,
    interpolateColor
} from "react-native-reanimated";


const {width, height} = Dimensions.get("window");


function HomePage({
                      pages,
                      primaryColor,
                      initialPosition,
                      navigationBarPoint,
                      menuElements,
                      defaultPage,
                      secondaryColor,
                      infinitLoopTimerInterval,
                      lockInterval
                  }: HomePageInterface) {
    const mainPageSnapPoints = pages.map((_, i) => i * -width);
    const index = useSharedValue(defaultPage ? defaultPage : 0);
    let page = defaultPage ? defaultPage : 0
    let [pageState, setPageState] = useState(page)
    const mainPageOffset = useSharedValue(0);
    const navBarOffset = useSharedValue(0);
    const mainPageTranslateX = useSharedValue(0);
    const navBarTranslateX = useSharedValue(0)
    const pageLength = useSharedValue(pages.length)
    const colorDictionary = pages.map((_, __) => {
        return useSharedValue(0)
    })


    const onGestureEvent = useAnimatedGestureHandler({
        onActive: ({translationX}) => {
            if (Math.abs(translationX) > (lockInterval ? lockInterval : 500)) {
                mainPageTranslateX.value = translationX + mainPageOffset.value
                navBarTranslateX.value = navBarOffset.value + (-1 / pageLength.value * translationX)
            }
        },
        onEnd: ({translationX}) => {
            if (translationX > 100 && index.value > 0) {
                mainPageTranslateX.value = mainPageSnapPoints[index.value - 1]
            } else if (translationX < -100 && index.value < pageLength.value - 1) {
                mainPageTranslateX.value = mainPageSnapPoints[index.value + 1]
            }
            index.value = Math.floor(mainPageTranslateX.value / -width)
            navBarTranslateX.value = navigationBarPoint[index.value]
            mainPageOffset.value = mainPageTranslateX.value
            navBarOffset.value = navBarTranslateX.value

        }
    })


    useEffect(() => {
        const timer = setInterval(() => {
            if (pageState !== index.value) {
                setPageState(index.value)
            }
        }, infinitLoopTimerInterval ? infinitLoopTimerInterval : 10);
        return () => {
            clearInterval(timer)
        };
    }, []);


    const styles = StyleSheet.create({
        container: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "white",


        },
        pages: {
            width: width * pages.length,
            height: height,
            flexDirection: "row",
            bottom: 0,
            position: "absolute",
        },
        navBar: {
            width,
            height: 80,
            left: -initialPosition,
            bottom: 0,
            position: "absolute",
            zIndex: 10
        },
        menuContainer: {
            width: 70,
            height: 70,
            borderRadius: 50,
            zIndex: 200,
            top: height - 90,
            position: "absolute",
        }

    });


    const mainPageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: withTiming(mainPageTranslateX.value, {duration: 250})}
            ]
        }
    })

    const navBarAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: withTiming(navBarTranslateX.value, {duration: 250})}
            ]
        }
    })

    const menuAnimatedStyle = (identifier: number) => {

        if (identifier === pageState) {
            return useAnimatedStyle(() => {

                return {
                    transform: [
                        {translateY: withTiming(0, {duration: 250})}
                    ],
                }
            })
        }
        return useAnimatedStyle(() => {
            return {
                transform: [
                    {translateY: withTiming(45, {duration: 250})}
                ],
            }
        })
    }


    const menuColorStyle = (identifier: number) => {
        if (identifier === pageState) {
            return useAnimatedStyle(() => {
                colorDictionary[identifier].value = withTiming(1, {duration: 250})
                const backgroundColor = interpolateColor(colorDictionary[identifier].value, [0, 1], [primaryColor, secondaryColor])

                return {
                    backgroundColor
                }
            })
        }
        return useAnimatedStyle(() => {
            colorDictionary[identifier].value = withTiming(0, {duration: 250})
            const backgroundColor = interpolateColor(colorDictionary[identifier].value, [0, 1], [primaryColor, secondaryColor])

            return {
                backgroundColor
            }
        })
    }


    return (
        <View style={styles.container}>
            <PanGestureHandler onGestureEvent={onGestureEvent}>
                <Animated.View style={StyleSheet.absoluteFill}>
                    <Animated.View
                        style={[styles.pages, mainPageAnimatedStyle]}
                    >
                        {pages.map((page) => (
                                page
                            )
                        )}
                    </Animated.View>

                    <Animated.View
                        style={[styles.navBar, navBarAnimatedStyle]}
                    >
                        <Image source={require('./assets/navigation.png')} style={{tintColor: primaryColor}}></Image>
                    </Animated.View>

                    {menuElements.map((element, index: number) => (

                        <Animated.View style={[{zIndex: 20}, menuAnimatedStyle(index)]} key={index}>
                            <Animated.View
                                style={[styles.menuContainer, {left: (width / 2 - 70 / 2) + navigationBarPoint[index]}, menuColorStyle(index)]}>
                                {element}
                            </Animated.View>

                        </Animated.View>


                    ))}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

export default HomePage;