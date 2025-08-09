#
# Makefile for Express.js + Prisma Backend
#

.PHONY: clean setup seed run

run: setup
	node src/server.js

setup:
	npm install

seed:
	npx prisma generate
	npx prisma db push
	npx prisma db seed

clean:
	rm -rf *~ prisma/dev*

realclean: clean
	rm -rf node_modules package-lock.json 
