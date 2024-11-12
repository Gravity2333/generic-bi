//@ts-ignore
import YELLOW_LEAF from "!!file-loader?name=static/[name].[ext]!./yellowLeaves.jpg"
import BRIDGE_SVG from "!!file-loader?name=static/[name].[ext]!./bridge.svg"
//@ts-ignore
import FOREST from "!!file-loader?name=static/[name].[ext]!./forest.jpg"
//@ts-ignore
import PINE_FOREST from "!!file-loader?name=static/[name].[ext]!./pine-forest.jpg"
//@ts-ignore
import MOUNTAIN from "!!file-loader?name=static/[name].[ext]!./mountain.jpg"
//@ts-ignore
import TURBINES from "!!file-loader?name=static/[name].[ext]!./turbines.jpg"
//@ts-ignore
import CITY_SAMPLE from "!!file-loader?name=static/[name].[ext]!./city-sample.jpg"

export const __DEFAULT_BACKGROUNDS__   = [
    {
        name: '灯塔',
        path: '/static/bridge.svg',
        cover: BRIDGE_SVG,
    },
    {
        name: '枫叶🍁',
        path: '/static/yellowLeaves.jpg',
        cover: YELLOW_LEAF
    },
    {
        name: '森林🌳',
        path: '/static/forest.jpg',
        cover: FOREST
    },
    {
        name: '松树林🌲',
        path: '/static/pine-forest.jpg',
        cover: PINE_FOREST
    },
    {
        name: '山峰⛰️',
        path: '/static/mountain.jpg',
        cover: MOUNTAIN
    },
    {
        name: '风车',
        path: '/static/turbines.jpg',
        cover: TURBINES
    },
    {
        name: '城市简笔',
        path: '/static/city-sample.jpg',
        cover: CITY_SAMPLE
    }
]