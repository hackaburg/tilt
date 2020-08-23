#!/bin/sh

# this change only exists as long as the container exists, which will eventually
# be re-created. the base image is not affected by this replacement
echo "[*] setting base url to '$BASE_URL'"
sed -i 's|<base href=""\s*/>|<base href="'$BASE_URL'"/>|' frontend/index.html

echo "[*] starting tilt"
node backend/tilt.js
