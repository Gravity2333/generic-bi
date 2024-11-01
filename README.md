# bi-server
一个通用的bi系统

## Getting Started

```bash
$ npm install lerna -g
# Or
$ cnpm install lerna -g
# Or
$ yarn global add lerna
```

---

## Yarn workspace 版本

### 依赖树关系

```bash
yarn workspaces info 
```

### 安装/删除依赖模块

```bash
# packageA 安装 axios
yarn workspace packageA add axios

# packageA 移除 axios
yarn workspace packageA remove axios
```

### 运行单个 package 的scripts 命令

```bash
# 运行 @bi/common 的 build 命令
yarn workspace @bi/common run build

# 这里是在每个工作区运行 run build 命令
yarn workspaces run build
```

### 前置依赖

由于 yarn workspace 未实现拓扑排序规则，所以只能手动先打包 `@bi/common`

```bash
yarn workspace @bi/common run build 
```

### Run server

```bash
yarn workspace @bi/manager run dev  
```

### Run web

```bash
yarn workspace @bi/manager-web run start  
```

---

## Lerna 版本

### 列举当前包含的包

```bash
$ lerna ll
```

### 前置依赖

> 或者是使用 lerna 的拓扑排序规则执行命令
> `lerna run --stream --sort build`

```bash
$ cd packages/bi-common && yarn run build
$ lerna bootstrap
```

### Run server

```bash
$ cd packets/bi-manager
$ yarn run dev
```

### Run web

```bash
$ cd packets/bi-manager-web
$ yarn run start
```

### 新增依赖

⚠️ 新增依赖不可以使用 `yarn add`，必须使用 `lerna add` 命令！

- 如果是多个包的共同依赖

```bash
lerna add echarts
```

- 如果只是某个包的单独依赖

例如在 `bi-manager` 中安装 `@posthog/clickhouse`

```bash
$ lerna add @posthog/clickhouse --scope bi-manager
```


## 安装 canvas
https://wbt5.com/jsdom-canvas.html


---

## Docker

```bash
docker-compose -f docker-compose.dev.yml stop
docker-compose -f docker-compose.dev.yml up -d
```

# generic-bi
