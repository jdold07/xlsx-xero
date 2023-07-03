# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.2](https://github.com/jdold07/xlsx-xero/compare/v0.3.1...v0.3.2) (2023-07-03)


### Features

* ✨ update DD invoice to handle lotto payouts ([302a7f9](https://github.com/jdold07/xlsx-xero/commit/302a7f9da3ddc166a6ce9c86f8260cbae9c5f8db))

### [0.3.1](https://github.com/jdold07/xlsx-xero/compare/v0.3.0...v0.3.1) (2023-07-03)

## [0.3.0](https://github.com/jdold07/xlsx-xero/compare/v0.2.0...v0.3.0) (2023-06-27)


### ⚠ BREAKING CHANGES

* Add programatic uploading of DD xls files with DD invoices.  This required some changes in existing logic, but absolutely worth the change.  No more forgetting the attachments during approval!!!

### Features

* ✨ add uploading of file attachments for DD invoices ([fe7af81](https://github.com/jdold07/xlsx-xero/commit/fe7af81052bf718b1e4983dbdd931c41e18700cd))
* ✨ refactor & add log file exists check ([1e84e04](https://github.com/jdold07/xlsx-xero/commit/1e84e0482a42147f2bcfa6f081823c011a063e95))
* ✨ replace hardcoded with dynamic timezone offset ([61ab284](https://github.com/jdold07/xlsx-xero/commit/61ab284f11c6828f9796d6209bb497eea1bf2525))


### Build Related

* ♻️ remove db import & format log output ([3a25e96](https://github.com/jdold07/xlsx-xero/commit/3a25e96cd7a2e9aa71926cc98de639828b01ee76))
* ♻️ tweak initialisation of invRes & crRes ([c1d9764](https://github.com/jdold07/xlsx-xero/commit/c1d976472f1907ee6e7be08989c3a4036db76113))
* ⚡️ add check for no files in import dir ([196e68e](https://github.com/jdold07/xlsx-xero/commit/196e68e7f53f067320a6bc60b4721b3d4230eef1))
* 📦 add timezone-mock package ([cd565b8](https://github.com/jdold07/xlsx-xero/commit/cd565b8632ed4191f557e350d53b577b8b5c1218))
* **types:** 🏷️ update types for file attachments ([c316de8](https://github.com/jdold07/xlsx-xero/commit/c316de8f22cb9f2b6ae7afcd233efed55fe33f12))

## [0.2.0](https://github.com/jdold07/xlsx-xero/compare/v0.1.6...v0.2.0) (2023-06-24)


### Build Related

* **config:** 🔧 revert to commonJS to resolve Xero SDK ([8c3833b](https://github.com/jdold07/xlsx-xero/commit/8c3833b4b69d54b70d3650f41f361ace921c25ab))

### [0.1.6](https://github.com/jdold07/xlsx-xero/compare/v0.1.5...v0.1.6) (2023-06-24)


### Bug Fixes

* 🩹 fix error in `getDueDate` func RE `TZ` handling ([1413d27](https://github.com/jdold07/xlsx-xero/commit/1413d27b28840b8182a08cb12fae2f60436796a3))


### Build Related

* 📦 update packages to latest ([c7a5035](https://github.com/jdold07/xlsx-xero/commit/c7a5035ba3a7f314a02ce97ca19ba361ac1dfeb0))
* 🔧 config changes around esm modules ([37f9bd7](https://github.com/jdold07/xlsx-xero/commit/37f9bd73ad09e2f7aae03cf88125a813157b6294))
* **config:** 🔧 update tsconfig to ESNext modules ([8e790ad](https://github.com/jdold07/xlsx-xero/commit/8e790ad6bfacf6ee33c354bd6bd4ea9be2961c8c))
* **db:** ⚡️ remove query for `TradingTerms` & update glCodes ([cfe221f](https://github.com/jdold07/xlsx-xero/commit/cfe221f3a827508b2ef4fcb7d6a8ce6387b79f1c))
* **db:** 🗃 edit `fetchChargesfromDB` to return `TradingTerms` ([d5aac68](https://github.com/jdold07/xlsx-xero/commit/d5aac6838be3edeb9cf540074c1b1f1b5d96cb47))
* prettier code formatting only ([5d0f865](https://github.com/jdold07/xlsx-xero/commit/5d0f8651af3bffd8aeb868d1d01fbb57c17f70db))
* reconfigure `open` import and call for esm workaround ([d3146bf](https://github.com/jdold07/xlsx-xero/commit/d3146bf1a9d6eaa7c0748aed566603c4f4791ea4))
* **types:** 🏷️ update `ChargeWithCustomer` type after query edit ([d90fad6](https://github.com/jdold07/xlsx-xero/commit/d90fad6a49a78b8c8a2926584695961d96194c45))

### [0.1.5](https://github.com/jdold07/xlsx-xero/compare/v0.1.4...v0.1.5) (2023-05-13)

### [0.1.4](https://github.com/jdold07/xlsx-xero/compare/v0.1.3...v0.1.4) (2023-05-13)


### Features

* ♻️ update to provide db data for getDueDate function ([24ba450](https://github.com/jdold07/xlsx-xero/commit/24ba45055472097f70063c80570fb04effad96b6))
* ✨ add function to update customer trading terms via api ([294b4b4](https://github.com/jdold07/xlsx-xero/commit/294b4b4faaab24eb62ca0550ba462e4d325a2e4e))
* ✨ update getDueDate function to use trading terms ([6c0a823](https://github.com/jdold07/xlsx-xero/commit/6c0a8230f1eef3cbfc8a46ae0e499e780e8fc59f))
* 🏷️ add Terms type for trading terms addition ([8b35d8a](https://github.com/jdold07/xlsx-xero/commit/8b35d8a3088bbe708edb4fb93dc011d97efb8aaa))


### Bug Fixes

* 🩹 minor "fixes" to createDDInvoice function ([37871b5](https://github.com/jdold07/xlsx-xero/commit/37871b5f20af289ead413171105c6a54d145a175))
* 🩹 modify due date for Day Docket Invoice ([fed0ab3](https://github.com/jdold07/xlsx-xero/commit/fed0ab34c255a860518df86c67d4b4b5606f7c84))
* 🚑️ add otherPayments return from db ([71cffd6](https://github.com/jdold07/xlsx-xero/commit/71cffd6f0897c984fa5f2b2eddaf812a32c45a51))

### [0.1.3](https://github.com/jdold07/xlsx-xero/compare/v0.1.2...v0.1.3) (2023-04-02)


### Features

* ✨ add script to update COA via API ✨ ([9202de9](https://github.com/jdold07/xlsx-xero/commit/9202de9b551b9b575f0ca25001be5280bcf92d9c))


### Bug Fixes

* 🩹 update account codes for change in COA ([bbbca01](https://github.com/jdold07/xlsx-xero/commit/bbbca019cae58c7e8776311c02decf81569639a5))


### Build Related

* ♻️ update error message to use formatted JSON.stringify ([f3827ae](https://github.com/jdold07/xlsx-xero/commit/f3827ae4e133dd1a742d650b1987dd9020f807a7))
* 📝 add scripts for running COA create/update ([2ab6f30](https://github.com/jdold07/xlsx-xero/commit/2ab6f30e3e208b392a9f244695a8135635e077c6))
* 📦️ update all dependencies to latest ([d12df6a](https://github.com/jdold07/xlsx-xero/commit/d12df6a7666dbd8cbea8abb46d8c0c14db0f223d))
* 🔥 remove unused protgres db queries for handling token set ([b9a0926](https://github.com/jdold07/xlsx-xero/commit/b9a0926c8f9ab36424b64a21f9beb316344dfa98))

### [0.1.2](https://github.com/jdold07/xlsx-xero/compare/v0.1.1...v0.1.2) (2023-03-25)


### Features

* ✨🎉 initial commit of auth function for new Xero tenant ([fe95a52](https://github.com/jdold07/xlsx-xero/commit/fe95a5237eaa95dca33f93ba6e2a74dfbe18e5ba))
* ✨🎉 initial commit of functional core utility ([33983c1](https://github.com/jdold07/xlsx-xero/commit/33983c171c64b57c91c1ef70aaa51855cc6c2d19))

### 0.1.1 (2023-03-25)
