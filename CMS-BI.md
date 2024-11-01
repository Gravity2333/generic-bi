# BI 和 CMS 联动部署的信息

## 暴露 CMS 上的 postgres

vi /opt/machloop/data/postgres-cms/data/postgresql.conf

```sh
listen_addresses = '*'
```

重启 postgres

```sh
systemctl restart postgresql-11
```

## 重启 BI

```sh
cd /opt/machloop/scripts/compose
# 停止
docker-compose -f bi-docker-componse.yml down
# 启动
docker-compose -f bi-docker-componse.yml up -d
```

## 查看 BI 的日志

```sh
cd /opt/machloop/log/bi-manager/
```

## 查看 BI 的配置文件

```sh
cd /opt/components/bi-apps/config
```

## openresty

### openresty 配置文件

`vi /opt/components/openresty/conf/nginx.conf`

### 重启 openresty

```sh
systemctl restart openresty
```

## 更新 BI 镜像

### 步骤一：打包

```
# 探针版本 X86_64
http://10.0.0.110:9999/job/bi-dev-build/

# 探针版本 ARM
http://10.0.0.110:9999/job/bi-dev-build-aarch64/

# CMS版本 X86_64
http://10.0.0.110:9999/job/bi-dev-build/

# CMS版本 ARM
http://10.0.0.110:9999/job/bi-dev-build-aarch64/

点击 【Build with Parameters】

填写 BUILD_VERSION v0.0.XXXX
```

### 步骤二：登录目标服务器拉取镜像

```sh
ssh -l root 10.0.4.164

# 探针版本 X86_64
docker pull 10.0.0.110:4443/machloop/bi-server:hj
docker tag 10.0.0.110:4443/machloop/bi-server:hj machloop/bi-server:hj

# 探针版本 ARM
docker pull 10.0.0.110:4443/machloop/bi-server:hj-aarch64
docker tag 10.0.0.110:4443/machloop/bi-server:hj-aarch64 machloop/bi-server:hj

# CMS版本 X86_64
docker pull 10.0.0.110:4443/machloop/bi-server:latest
docker tag 10.0.0.110:4443/machloop/bi-server:latest machloop/bi-server:latest

# CMS版本 ARM
docker pull 10.0.0.110:4443/machloop/bi-server:dev-aarch64
docker tag 10.0.0.110:4443/machloop/bi-server:dev-aarch64 machloop/bi-server:latest
```

### 步骤三：修改 BI 配置文件

如果没有要修改的配置，此步骤跳过即可

```
NPMD: vi /opt/components/bi-apps/app/dist/config/config.default.js
CMS: vi /opt/components/bi-apps/config/config.default.js
```

### 步骤四：重启 BI 服务

```sh
cd /opt/machloop/scripts/bi

# 先停止服务
docker-compose down
# 再重启服务
docker-compose up -d
```


### 获取docker服务器权限
```
探针
cp -f /opt/machloop/config/nginx/certs/ca.crt /etc/pki/ca-trust/source/anchors/
update-ca-trust
systemctl restart docker

cms
cp -f /opt/components/openresty/conf/certs/ca.crt /etc/pki/ca-trust/source/anchors/
update-ca-trust
systemctl restart docker
```