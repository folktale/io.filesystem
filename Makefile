bin        = $(shell npm bin)
sjs        = $(bin)/sjs
browserify = $(bin)/browserify
jsdoc      = $(bin)/jsdoc
uglify     = $(bin)/uglifyjs
VERSION    = $(shell node -e 'console.log(require("./package.json").version)')

# -- Configuration -----------------------------------------------------
PACKAGE  = <%= pkg.name %>
EXPORTS  = <%= pkg.exports %>

LIB_DIR  = lib
SRC_DIR  = src
SRC      = $(wildcard $(SRC_DIR)/*.sjs)
TGT      = ${SRC:$(SRC_DIR)/%.sjs=$(LIB_DIR)/%.js}

TEST_DIR = test/specs-src
TEST_BLD = test/specs
TEST_SRC = $(wildcard $(TEST_DIR)/*.sjs)
TEST_TGT = ${TEST_SRC:$(TEST_DIR)/%.sjs=$(TEST_BLD)/%.js}


# -- Compilation -------------------------------------------------------
$(LIB_DIR)/%.js: $(SRC_DIR)/%.sjs
	mkdir -p $(dir $@)
	$(sjs) --readable-names \
	       --sourcemap      \
	       --module adt-simple/macros \
	       --module sparkler/macros \
	       --module sweet-fantasies/src/do \
	       --module es6-macros/macros/destructure \
	       --module lambda-chop/macros \
	       --module macros.operators \
	       --module ./macros/liftF \
	       --output $@      \
	       $<

$(TEST_BLD)/%.js: $(TEST_DIR)/%.sjs
	mkdir -p $(dir $@)
	$(sjs) --readable-names        \
	       --module hifive/macros  \
	       --module alright/macros \
	       --output $@             \
	       $<


# -- Tasks -------------------------------------------------------------
all: $(TGT)

documentation:
	$(jsdoc) --configure jsdoc.conf.json
	ABSPATH=$(shell cd "$(dirname "$0")"; pwd) $(MAKE) clean-docs

clean-docs:
	perl -pi -e "s?$$ABSPATH/??g" ./docs/*.html

clean:
	rm -rf dist build $(LIB_DIR)

test: all $(TEST_TGT)
	node test/run

package: documentation
	mkdir -p dist/$(PACKAGE)-$(VERSION)
	cp -r docs dist/$(PACKAGE)-$(VERSION)
	cp -r lib dist/$(PACKAGE)-$(VERSION)
	cp package.json dist/$(PACKAGE)-$(VERSION)
	cp README.md dist/$(PACKAGE)-$(VERSION)
	cp LICENCE dist/$(PACKAGE)-$(VERSION)
	cp CONTRIBUTING.md dist/$(PACKAGE)-$(VERSION)
	cd dist && tar -czf $(PACKAGE)-$(VERSION).tar.gz $(PACKAGE)-$(VERSION)

publish: clean test
	npm install
	npm publish

bump:
	node tools/bump-version.js $$VERSION_BUMP

bump-feature:
	VERSION_BUMP=FEATURE $(MAKE) bump

bump-major:
	VERSION_BUMP=MAJOR $(MAKE) bump

.PHONY: test bump bump-feature bump-major publish package clean documentation
