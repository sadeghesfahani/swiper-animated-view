interface HomePageInterface {
    pages: JSX.Element[],
    primaryColor: string,
    initialPosition: number,
    navigationBarPoint: number[],
    menuElements: JSX.Element[],
    defaultPage?: number,
    secondaryColor:string,
    lockInterval?: number,
    infinitLoopTimerInterval?:number
}

export default HomePageInterface;