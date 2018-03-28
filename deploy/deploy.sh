#!/bin/bash
# Deployment-skript som kjøres av Travis etter suksessfull build av production-branchen

rsync -r --update -e "ssh -o StrictHostKeyChecking=no" $TRAVIS_BUILD_DIR/ $FTP_USER@api.gieffektivt.no:/var/www/api/
ssh $FTP_USER@api.gieffektivt.no "pm2 restart all; exit;"