//@ts-ignore
import YELLOW_LEAF from "!!file-loader?name=static/[name].[ext]!./yellowLeaves.jpg"
import BRIDGE_SVG from "!!file-loader?name=static/[name].[ext]!./bridge.svg"

export const __DEFAULT_BACKGROUNDS__   = [
    {
        name: '简约',
        path: '/static/bridge.svg',
        cover: BRIDGE_SVG
    },
    {
        name: '枫叶',
        path: '/static/yellowLeaves.jpg',
        cover: YELLOW_LEAF
    }
]