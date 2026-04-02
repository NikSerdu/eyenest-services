#!/bin/sh
set -e
npx prisma db push
exec node dist/src/main.js
