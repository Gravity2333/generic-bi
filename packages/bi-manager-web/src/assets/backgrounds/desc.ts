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
const isDev = process.env.NODE_ENV === 'development';


export const __DEFAULT_BACKGROUNDS__   = [
    {
        name: '灯塔',
        path: isDev?'/static/bridge.svg': '/bi/web-static/static/bridge.svg',
        cover: BRIDGE_SVG,
    },
    {
        name: '枫叶🍁',
        path: isDev?'/static/yellowLeaves.jpg':'/bi/web-static/static/yellowLeaves.jpg',
        cover: YELLOW_LEAF
    },
    {
        name: '森林🌳',
        path: isDev?'/static/forest.jpg':'/bi/web-static/static/forest.jpg',
        cover: FOREST
    },
    {
        name: '松树林🌲',
        path: isDev?'/static/pine-forest.jpg':'/bi/web-static/static/pine-forest.jpg',
        cover: PINE_FOREST
    },
    {
        name: '山峰⛰️',
        path: isDev?'/static/mountain.jpg':'/bi/web-static/static/mountain.jpg',
        cover: MOUNTAIN
    },
    {
        name: '风车',
        path: isDev?'/static/turbines.jpg':'/bi/web-static/static/turbines.jpg',
        cover: TURBINES
    },
    {
        name: '城市简笔',
        path: isDev?'/static/city-sample.jpg':'/bi/web-static/static/city-sample.jpg',
        cover: CITY_SAMPLE
    }
]