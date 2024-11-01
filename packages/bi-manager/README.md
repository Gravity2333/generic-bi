# BI-manager

### 运行项目

### 修改环境参数

当前的 BI 项目合并 NPMD 和 CMS 的版本，并且通过宿主机的环境变量"BI_VERSION" 对工作模式进行区分
”BI_VERSION“ 有两个值:
"CMS": 表示 BI 工作在 CMS 环境中
"NPMD": 表示 BI 工作在 NPMD 环境中

在生产环境部署时, 会通过不同 Dockefile 中的变量值对 BI 的工作模式进行区分，在开发模式中，需要手动修改当前环境的环境变量以模拟不同的环境，以下为修改过程：

1. 在终端中输入 sudo vim ~/.bash_profile
2. 在配置文件的后面补充添加 export BI_VERSION=NPMD (这里可以替换为 CMS)
3. 退出后，需执行以下命令使配置文件生效 source ~/.bash_profile
4. 打开新的终端 输入 node 查看 process.env.BI_VERSION 查看当前的变量值

### 修改环境的 docker-compose 文件，暴露 postgre redis 接口

1. 使用 ssh -l root xxxx 登陆服务器环境
2. 输入 vi /opt/components/bi-apps/config/config.default.js 进入配置文件，并且修改以下配置后保存
   config.cluster = {
   listen: {
   path: "",
   port: 41130,
   hostname: "127.0.0.1", => hostname: "0.0.0.0",
   },
   };
3. cd /opt/machloop/scripts/bi 进入 docker-compose 目录, vi docker-compose.yml 修改 docker-compose 文件，对以下位置进行修改后保存
   bi-postgres:
   container_name: machloop-bi-postgres # 生成的容器名称
   restart: always
   image: postgres:11 # postgres 镜像
   networks:
   bi:
   ipv4_address: 192.21.0.2
   #ports: => ports: [ports 和 networks 对其]
   #- 5433:5432 # 映射端口号 => -5433:5432 [-和 port 的'r'对其]

bi-redis:
container_name: machloop-bi-redis
image: redis:latest
restart: always
networks:
bi:
ipv4_address: 192.21.0.3
#ports: => ports: [ports 和 networks 对其]
#- 6380:6379 => -5433:5432 [-和 port 的'r'对其]

4.  重启 docker 服务
    # 先停止服务
    docker-compose down
    # 再重启服务
    docker-compose up -d

### 暴露 clickhouse

1. 进入 clickhouse 的 docker-compose 目录 cd /opt/machloop/scripts/compose
2. 进入 vi docker-compose.yml 并且做以下修改
   ports:
   - "127.0.0.1:8123:8123" => - "8123:8123"
   - "127.0.0.1:9001:9000"
     #- "9443:8443"
3. 重启 docker 服务
   # 先停止服务
   docker-compose down
   # 再重启服务
   docker-compose up -d

### 暴露 postgre

1. 打开 postgre 配置文件
   CMS: vi /opt/machloop/data/postgres-cms/data/postgresql.conf
   NPMD: vi /opt/machloop/data/postgres-fpc/data/postgresql.conf

2. 做以下修改
   #listen_addresses = 'localhost' # what IP address(es) to listen on;
   => listen_addresses = '_' # comma-separated list of addresses; # defaults to 'localhost'; use '_' for all # (change requires restart)
   #port = 5432 # (change requires restart)
   => port = 5432
   max_connections = 100 # (change requires restart)

3. 重启 postgre 服务 systemctl restart postgresql-11

### 启动项目

1. 输入 yarn workspace @bi/manager run dev 运行项目即可
