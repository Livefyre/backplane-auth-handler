.PHONY: server test dist deploy

ENV=dev

server:
	node ./server.js

install: package.json bower.json
	npm install
	node node_modules/.bin/bower install
	touch $@

amd:
	cp index.js util/
	node_modules/.bin/r.js -convert util amd/util
	node_modules/.bin/r.js -convert bower_components/auth amd/auth
	node_modules/.bin/r.js -convert bower_components/base64 amd/base64
	node_modules/.bin/r.js -convert bower_components/event-emitter amd/event-emitter
	node_modules/.bin/r.js -convert bower_components/inherits amd/inherits
	node_modules/.bin/r.js -convert bower_components/debug amd/debug
	node_modules/.bin/r.js -convert bower_components/mout amd/mout
	node_modules/.bin/r.js -convert bower_components/livefyre-auth amd/livefyre-auth
	rm util/index.js

test: install amd
	node node_modules/.bin/tap test/*.js

dist: install
	mkdir -p dist
	node ./node_modules/requirejs/bin/r.js -o ./build.conf.js
	node ./node_modules/requirejs/bin/r.js -o ./build.conf.js optimize=none out=./dist/index.js

deploy: dist
	node ./node_modules/.bin/lfcdn -e $(ENV)

clean:
	-rm -rf dist node_modules bower_components amd
	-rm install
