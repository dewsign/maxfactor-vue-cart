# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Changes

- Remove Mix as no longer used as build tool

## [0.6.11] - 2018-07-02

### Changes

- Stop the user from using the back button after completing a payment (which allowed them to pay again)

## [0.6.10] - 2018-05-29

### Fixed

- Only update cart items from server if not viewing first stage of checkout
- Ensure only checkout items object values are added to cart

- Check for PayPal successful payment response

## [0.6.9] - 2018-05-22

### Fixed

- Check for PayPal successful payment response

## [0.6.8] - 2018-05-22

### Fixed

- Set errors correctly on form mixin

## [0.6.6] - 2018-05-04

### Fixed

- Ensure submit button disabled states are handled correctly to avoid duplicate transactions
- Add address county to address sync and clear methods in checkout Mixin

## [0.6.2] - 2018-04-26

### Fixed

- Clear discount object after successfully checking out

## [0.6.0] - 2018-04-23

### Added

- Added notes to order addresses

## [0.5.4] - 2018-04-18

### Fixed

- When checking for a valid checkout ensure stage is less than or equal to the complete stage

## [0.5.1] - 2018-04-17

### Added

- Update front end checkout items with items returned from server

## [0.4.0] - 2018-02-21

### Added

- Allow minimum quantity to be overloaded to avoid negative quantity line items

### Fixed

- Installed missing packages
- Add repository link to package
- Fix issues with removing items not working
- Fix Tax calculations in cart and checkout
- Fix Tax calculations when postage is chargeable

## [0.3.0] - 2018-02-20

### Added

- This CHANGELOG file to hopefully serve as an evolving example of a
  standardized open source project CHANGELOG.
- Free Orders. Allows for orders to be processed without attempting to take payment when their total value is zero.
- Added version number to the required Laravel Checkout repository.
