#!/bin/bash

for dir in $(ls -1 /node_modules.d); do
    if [ "$dir" == "bi-common" ]; then
        mkdir -p /usr/src/app/node_modules/\@bi
        ln -sf /node_modules.d/$dir /usr/src/app/node_modules/\@bi/common
    else
        ln -sf /node_modules.d/$dir /usr/src/app/node_modules/$dir
    fi
done

exec "$@"

