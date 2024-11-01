#!/bin/bash

# bi-builder构建bi.tar.gz
workspace="$(dirname $0)"
cd ${workspace}

cp -rf ${workspace}/packages/bi-common /build/packages/
cd /build/packages/bi-common && npm run build
mkdir -p /build/node_modules/\@bi
ln -sf /build/packages/bi-common /build/node_modules/\@bi/common

cp -rf ${workspace}/packages/bi-manager-web /build/packages/
cd /build/packages/bi-manager-web && npm run build
cp -rf ${workspace}/packages/bi-manager /build/packages/
cd /build/packages/bi-manager && npm run build

cd ${workspace}
install -d bi/{extra_modules,app}
install -d bi/app/{dist,view}
install -d bi/app/dist/app/public
install -d bi/app/dist/init/{dashboard,sql}
install -d -m 777 bi/app/dist/resources/pdf
cp -rf /build/packages/bi-common                                   bi/extra_modules/
cp -rf /build/packages/bi-manager/dist/*                           bi/app/dist/
cp -f  /build/packages/bi-manager-web/dist/index.html              bi/app/view/
cp -rf /build/packages/bi-manager-web/dist/*                       bi/app/dist/app/public/
cp -f  /build/packages/bi-manager/dist/app/init/dashboard/index.bi bi/app/dist/init/dashboard/
cp -f  /build/packages/bi-manager/dist/app/init/sql/init_data.sql  bi/app/dist/init/sql/
tar czf bi.tar.gz bi/
rm -rf bi/

