start:
	npm run dev

check:
	npm run format:nofix && npm run lint:nofix

check-formatting:
	npm run format:nofix

check-linter:
	npm run lint:nofix

check-compilation:
	npm run tsc:noEmit

full-check:
	npm run format:nofix && npm run lint:nofix && npm run tsc:noEmit

fix:
	npm run format && npm run lint --fix

fix-formatting:
	npm run format

fix-lint:
	npm run lint --fix