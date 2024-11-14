import YELLOW_LEAF from "!!file-loader?name=static/[name].[ext]!./yellowLeaves.jpg"
import BRIDGE_SVG from "!!file-loader?name=static/[name].[ext]!./bridge.svg"
import FOREST from "!!file-loader?name=static/[name].[ext]!./forest.jpg"
import PINE_FOREST from "!!file-loader?name=static/[name].[ext]!./pine-forest.jpg"
import MOUNTAIN from "!!file-loader?name=static/[name].[ext]!./mountain.jpg"
import TURBINES from "!!file-loader?name=static/[name].[ext]!./turbines.jpg"
import CITY_SAMPLE from "!!file-loader?name=static/[name].[ext]!./city-sample.jpg"
import ISLAND from "!!file-loader?name=static/[name].[ext]!./island.webp"

export const __DEFAULT_BACKGROUNDS__   = [
    {
        name: '灯塔',
        path: BRIDGE_SVG,
        cover: BRIDGE_SVG,
    },
    {
        name: '枫叶🍁',
        path: YELLOW_LEAF,
        cover: YELLOW_LEAF
    },
    {
        name: '森林🌳',
        path:FOREST,
        cover: FOREST
    },
    {
        name: '松树林🌲',
        path: PINE_FOREST,
        cover: PINE_FOREST
    },
    {
        name: '山峰⛰️',
        path: MOUNTAIN,
        cover: MOUNTAIN
    },
    {
        name: '风车',
        path: TURBINES,
        cover: TURBINES
    },
    {
        name: '城市简笔',
        path: CITY_SAMPLE,
        cover: CITY_SAMPLE
    },
    {
        name: '小岛小岛',
        path: ISLAND,
        cover: ISLAND
    }
    
]