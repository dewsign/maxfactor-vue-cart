# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Payment provider being reset incorrectly if discount of less than 100% used

## [0.4.0] - 2018-02-21

### Added

- Allow minimum quantity to be overloaded to avoid negative quantity line items

### Fixed

- Installed missing packages
- Add repository link to package
- Fix issues with removing items not working
- Fix Tax calculations in cart and checkout
- Fix Tax calculations when postage is chargable

## [0.3.0] - 2018-02-20

### Added

- This CHANGELOG file to hopefully serve as an evolving example of a
  standardized open source project CHANGELOG.
- Free Orders. Allows for orders to be processed without attempting to take payment when their total value is zero.
- Added version number to the required Laravel Checkout repository.
