# 使用 Docker 构建和运行 bi-server

## bi-builder

`bi-builder`镜像用于构建`bi-server`代码，镜像中打包了`bi-server`的所有依赖，流水线构建`bi-server`代码时不再执行`npm install`下载依赖包，加速构建过程。

在`bi-common`, `bi-manager-web`, `bi-manager`的`package.json`中增加依赖项时，需要更新 `bi-builder` 镜像。

### 构建 bi-builder 镜像

分别在 x86_64 和 arm64v8 环境使用 `Dockerfile.builder` 镜像构建 `bi-builder` 镜像。

```bash
# x86_64
docker build -t machloop/bi-builder:hj-x86_64 -f Dockerfile.builder .

# arm64v8
docker build -t machloop/bi-builder:hj-arm64v8 -f Dockerfile.builder .
```

### 推送 bi-builder 镜像到 Harbor

```bash
# 登录 Harbor 并输入用户名密码
docker login 10.0.0.110:4443

# x86_64
docker tag machloop/bi-builder:hj-x86_64 10.0.0.110:4443/machloop/bi-builder:hj-x86_64
docker push 10.0.0.110:4443/machloop/bi-builder:hj-x86_64

# arm64v8
docker tag machloop/bi-builder:hj-amr64v8 10.0.0.110:4443/machloop/bi-builder:hj-arm64v8
docker push 10.0.0.110:4443/machloop/bi-builder:hj-arm64v8
```

## bi-runner

`bi-runner`镜像用于运行`bi-server`。镜像已添加到基础包中。安装包中只需要打包编译过的`bi-common`和`bi-server`代码，安装时将`bi-server`目录映射到`bi-runner`容器中运行。

在`bi-manager`的`package.json`中增加依赖项时，需要更新`bi-runner`镜像并在基础包中替换。

### 构建 bi-runner 镜像

```bash
# x86_64
docker build -t machloop/bi-runner:hj-x86_64 -f Dockerfile.runner .

# arm64v8
docker build -t machloop/bi-runner:hj-arm64v8 -f Dockerfile.runner.arm .
```

### 推送 bi-runner 镜像到 Harbor

```bash
# x86_64
docker tag machloop/bi-runner:hj-x86_64 10.0.0.110:4443/machloop/bi-runner:hj-x86_64
docker push 10.0.0.110:4443/machloop/bi-runner:hj-x86_64

# arm64v8
docker tag machloop/bi-runner:hj-amr64v8 10.0.0.110:4443/machloop/bi-runner:hj-arm64v8
docker push 10.0.0.110:4443/machloop/bi-runner:hj-arm64v8
```

### 导出 bi-runner 镜像替换到基础包

1. 分别给 x86_64 环境和 arm64v8 环境的`bi-runner`镜像打`hj`标签。

```bash
# x86_64
docker tag machloop/bi-runner:hj-x86_64 machloop/bi-runner:hj

# arm64v8
docker tag machloop/bi-runner:hj-arm64v8 machloop/bi-runner:hj
```

2. 导出镜像tarball

```bash
docker save machloop/bi-runner:hj | gzip > bi-runner.tar.gz
```

3. 替换基础包中的`bi-runner`镜像，镜像在基础包中的路径分别如下

x86_64: svn://10.0.0.110/fpc-install/branches/caps/infrastructure/es_clickhouse
arm64v8: svn://10.0.0.110/infrastructure/branches/dev_tfa_npmd_aarch64/images

## 使用 bi-builder 镜像打包 bi-server

1. 检出`bi-server`代码库并切换到代码库目录。

```bash
git clone -b HJ http://10.0.0.110:3000/hujingbang/bi-server.git
cd bi-server
```

2. 将代码库目录映射到容器，并使用脚本构建`bi-server`安装包。

```bash
docker run -it --rm -v $(pwd):/bi-server machloop/bi-builder:hj bash /bi-server/bi-server-build.sh
```

## 运行 bi-server

将生成的`bi-server`安装包`bi.tar.gz`复制到测试环境并解压到安装目录，重启`machloop-bi-server`容器运行`bi-server`。

```bash
tar zxf bi.tar.gz -C /opt/components/bi-apps/ --strip-components=1
docker restart machloop-bi-server
```
