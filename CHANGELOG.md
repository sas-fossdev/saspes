# Changelog

## Open Beta 0.18.0 - 2019-12-20

### Added

* Add AUTHORS file ([@gary-kim](https://github.com/gary-kim)) [#58](https://github.com/gary-kim/saspes/pull/58)
* Generate attributions during build process ([@gary-kim](https://github.com/gary-kim)) [#55](https://github.com/gary-kim/saspes/pull/55)
* Add Ava Unit Testing ([@gary-kim](https://github.com/gary-kim)) [#25](https://github.com/gary-kim/saspes/pull/25)

### Changed

* Migrate HypoGrades to Vue ([@gary-kim](https://github.com/gary-kim)) [#16](https://github.com/gary-kim/saspes/pull/16)
* Remove unnecessary analytics information ([@gary-kim](https://github.com/gary-kim)) [#37](https://github.com/gary-kim/saspes/pull/37)
* Enhance Extension Info Pane ([@gary-kim](https://github.com/gary-kim)) [#28](https://github.com/gary-kim/saspes/pull/28)
* Improved Version Management ([@gary-kim](https://github.com/gary-kim)) [#56](https://github.com/gary-kim/saspes/pull/56)

### Fixed

* Fix Incorrect GPA Conversion When Grade is F ([@gary-kim](https://github.com/gary-kim)) [#41](https://github.com/gary-kim/saspes/pull/41)
* Fix Semester 2 Grade parsing ([@gary-kim](https://github.com/gary-kim)) [#69](https://github.com/gary-kim/saspes/pull/69)

### Removed

* Remove Drone OSS CI ([@gary-kim](https://github.com/gary-kim)) [#40](https://github.com/gary-kim/saspes/pull/40)

### Dependencies

* build(deps-dev): bump @babel/core from 7.6.0 to 7.6.4 [#32](https://github.com/gary-kim/saspes/pull/32)
* build(deps-dev): bump eslint from 6.4.0 to 6.5.1 [#29](https://github.com/gary-kim/saspes/pull/29)
* build(deps-dev): bump webextension-polyfill from 0.4.0 to 0.5.0 [#34](https://github.com/gary-kim/saspes/pull/34)
* build(deps-dev): bump chromedriver from 77.0.0 to 78.0.1 [#45](https://github.com/gary-kim/saspes/pull/45)
* build(deps-dev): bump geckodriver from 1.19.0 to 1.19.1 [#44](https://github.com/gary-kim/saspes/pull/44)
* build(deps-dev): bump webpack from 4.40.2 to 4.41.2 [#30](https://github.com/gary-kim/saspes/pull/30)
* build(deps): bump @babel/preset-env from 7.6.2 to 7.6.3 [#36](https://github.com/gary-kim/saspes/pull/36)


## Open Beta 0.1.7.2 - 2019-10-23

GitHub is now the offical home for the SAS PES project.

### Added
* Add No Warrently Disclaimer ([@gary-kim](https://github.com/gary-kim)) [#26](https://github.com/gary-kim/saspes/pull/26)

### Changed
* Change all project website links to GitHub repository ([@jadijadi](https://github.com/jadijadi)) [#19](https://github.com/gary-kim/saspes/pull/19)
* Update all dependencies
* Adjust readme and contributing ([@gary-kim](https://github.com/gary-kim)) [#21](https://github.com/gary-kim/saspes/pull/21)

### Fixed
* Fix a bug where hypothetical assignment calculator would calculate a grade and final percent that don't match ([@tcode2k16](https://github.com/tcode2k16)) [#20](https://github.com/gary-kim/saspes/pull/20)
* Properly configure Babel


## Open Beta 0.1.7.1 - 2019-09-18

### Fixed
* Fix Hypo Assignment giving the incorrect grade for a corresponding final percent if the final percent is on a cutoff.

## Open Beta 0.1.7.0 - 2019-09-18

### Added
* Open options page on new install

### Fixed
* Fix Hypo Grade Calculator sometimes now showing
* Fix parsing issue introduced by 2019 Powerschool update
* Fix an issue where Hypo Assignment would not show proper grade selection introduced during Vue migration.

### Miscellaneous

* **License:** SAS Powerschool Enhancement Suite has been relicensed to AGPL-3.0-only
* **Technical Debt:** npm is now used to manage dependencies
* **Technical Debt:** Webpack is now used to build the final release
* **Technical Debt:** `web-ext` is now used to package the final release
* **Technical Debt:** Linters have been added
* **Technical Debt:** Travis-CI is now used to check that the code can be built
* **Install:** The options page is now opened on first install
* **jQuery:** jQuery has been updated to `3.4.1`
* **Contributing:** Contributing now requires the DCO.  
* **Vue Migration:** Hypo Assignment has been migrated to Vue.
* **Vue Migration:** Extension Info has been migrated to Vue.

# Open Beta 0.1.6.1

## 2019-04-25

### Bug fix

* **Hypo Assignment Calculator:** Fixed a bug where the hypothetical assignment could have an effect that was higher then 100% or lower then 0%.

# Open Beta 0.1.6

## 2019-04-24

### Features

* **Hypo Assignment Calculator:** Check how your class grade will be effected by a new assignment!
* **Login Page:** The login page now contains information about SAS Powerschool Enhancement Suite

### Miscellaneous

* **Options Page:** Repo link has been changed to GitHub.
* **Copyright Header:** A copyright header has been added to many files.

# Open Beta 0.1.5.7

## 2019-01-15

### Bug Fixes

* **Final Percent:** Final percent is no longer shown on the main page if the course has no grade.

### Improvements

* **Performance:** More functions have been moved away from using jQuery.
* **Changelog:** A version changelog box is being worked on but is not used yet.
* **Options Page:** Homepage url has been added to the manifest.

# Open Beta 0.1.5.6

## 2019-01-11

### Bug Fixes

* **Final Percent:** Code to identify the final percent has been vastly improved.

# Open Beta 0.1.5.5

## 2019-01-04

### Changes

* **Information:** The message about the temporary disabling of the Last Seen Grades feature has been moved to the options page.

# Open Beta 0.1.5.4

## 2019-01-03

### Bug Fixes

* **GPA Calculator:** Fixed an issue that resulted in AT courses not getting a boost.

### Changes

* **Last Seen Grades:** Last seen grades has been temoprarily disabled for further developement and bugfixes.

### Improvements

* **Behind The Scenes:** Background, options, and content scripts have been transitioned to using strict mode.
* **Performance:** Work is progressing to reduce usage of jQuery.

# Open Beta 0.1.5.3

## 2018-12-27

### Bug Fixes

* **GPA Calculator:** Fixed an issue where "Studies" courses were not getting the proper weighting.
* **Hypo Grade Calculator/Last Seen Grades:** Fixed an issue where some courses would have extra spaces added to the end of their name.
* **Options:** Clicking the option labels now toggles their corresponding checkbox.
* **Analytics:** Fixed analytics disabled ping not working.

# Open Beta 0.1.5.2

## 2018-12-27

### Improvements

* **GPA Calculator:** The GPA Calculator now considers different weightings of "Studies" courses and Interim Semester courses.
* **Regex:** Regex expressions have been rewritten to be less prone to breckage.

# Open Beta 0.1.5.1

## 2018-12-26

### Bug Fixes

* **Last Seen Grades:** Fixed a bug where the Last Seen Grades popup or tab would not have a title if there was no information avaliable.

### Improvements

* **Analytics:** Made analytics ping for analytics being turned off.

# Open Beta 0.1.5.0

## 2018-12-25

### Improvements

* **Analytics:** Analytics have been added to links in the options page.

### Miscellaneous

* **Source Code:** Preperations made to release extension source code.

# Open Beta 0.1.4.5

## 2018-12-21

### Bug Fixes

* **Main Page/Class Page:** Fixed a bug that mae it so that the regex for final percent did not work.

# Open Beta 0.1.4.4

## 2018-12-14

### Improvements

* **Options:** Added campaign name to link for extension website to better understand website usage.

# Open Beta 0.1.4.3

## 2018-12-08

### Compatability update for Firefox only

# Open Beta 0.1.4.2

## 2018-12-08

### Improvements

* **Analytics:** Options being used are now part of the analytics data.

# Open Beta 0.1.4.1

## 2018-12-08

### Improvements

* **Analytics:** Last seen grades and extension options screen now have analytics.

# Open Beta 0.1.4.0

## 2018-12-08

### Features

* **Last Seen Grades:** You can now view the last set of grades and final percents that were seen when the website was last opened.

# Open Beta 0.1.3.6

## 2018-12-07

### Bug Fixes

* **Class Page:** Made sure that final percent is always reported to the hundreth place.


# Open Beta 0.1.3.5

## 2018-12-07

### Bug Fixes

* **Main Page:** Made sure that final percent is always reported to the hundreth place.

### Miscellaneous

* **Options:** Added a link to the extension website.

# Open Beta 0.1.3.4

## 2018-12-05

### Bug Fixes

* **GPA Calculator:** Fixed a bug that made SAS Catalyst recieve a 0.25 boost when it should not get a boost.

# Open Beta 0.1.3.3

## 2018-11-26

### **Notice:** This release will request clipboard read and write permissions.

### Improvements

* **Options:** Added a copy button for copying analytics id.

# Open Beta 0.1.3.2

## 2018-11-21

### Bug Fixes

* **GPA Calculator:** Fixed a bug where when no classes have grades, the GPA would be reported without decimal places.

### Improvements

* **Analytics:** Added extra fields to better track total users.

# Open Beta 0.1.3.1

## 2018-11-19

### Miscellaneous

* **Distribution:** Due to being rejected from Mozilla AMO, the Firefox release has been changed back to self distribution.

# Open Beta 0.1.3

## 2018-11-19

### Open beta release

# Closed Beta 0.1.2.1

## 2018-11-19

### Branding

* **Short Name:** The extension now has the short name SAS PES.
* **Description:** A speling mistake in the description has been corrected.

### Bug Fixes

* **GPA Calculator:** Fixed a bug that would result in the GPA not being shown to two decimal places in some circumstances.

# Closed Beta 0.1.2

## 2018-11-18

### Branding

* **Name:** Name has been changed from SAS Powerschool Extension to SAS Powerschool Enhancement Suite to reflect the much more expansive feature set that the extension now has and is planned to have.
* **Logo:** Open Beta logo design has been determined and has been added in this update.

### Miscellaneous

* **Options:** Analytics id has been added to the options page to allow for people to more easily request an archive of or deletion of collection analytics data.

# Closed Beta 0.1.1

## 2018-11-17

### Improvements

* **Class Page:** Final percent can now be viewed on all score pages with the information avaliable.

### Bug Fixes

* **All Pages:** Fixed bug that made the extension options button only show up on the main page.

# Closed Beta 0.1.0.4

## 2018-11-16

### Branding

* **Logo:** New logo design!

# Closed Beta 0.1.0.3

## 2018-11-15

### Branding

* **Logo:** First design for logo has been added!

### Bug Fixes

* Various bugs swatted out of the code!

# Closed Beta 0.1.0.2

## 2018-11-09

### Bug Fixes

* **GPA Calculator:** Fixed incorrect calculation for boosts when the grade is a C.

# Closed Beta 0.1.0.1

## 2018-11-09

### Bug Fixes

* **Main Page:** Made sure that final percent on main page still works during second semester.

# Closed Beta 0.1.0.0

## 2018-11-08

### Final preperation for release

# Closed Beta 0.0.10.3

## 2018-11-08

### Bug Fixes

* **GPA Calculator:** Fixed incorrect calculation for boosts when grade is lower then C+.

# Closed Beta 0.0.10.2

## 2018-11-08

### Improvements

* **All Pages:** Added link to go to extension options.

# Closed Beta 0.0.10.1

## 2018-11-07

### Miscellaneous

* **Manifest:** Fixed spelling error in extension information.

# Closed Beta 0.0.10

## 2018-11-07

### Features

* **Main Page:** Final percent for every course can now be viewed on the main page.

# Closed Beta 0.0.9.4

## 2018-11-05

### Bug Fixes

* **GPA Calculator:** Fixed a bug that occured when the user had a class that had more then one teacher that caused the program to misread course names.

### Improvements

* **Code Cleanups**

# Closed Beta 0.0.9.3

## 2018-11-04

### Bug Fixes

* **Analytics:** Bug fix for error in reporting version number for analytics.

# Closed Beta 0.0.9.2

## 2018-11-04

### Improvements

* **Hypo Grade Calculator:** Course names in hypo grade calculator are now links to their respective class pages.

### Miscellaneous

* **Options Page:** Contact info information changed slightly to be more clear.

# Closed Beta 0.0.9.1

## 2018-11-04

### Improvements

* **Hypo Grade Calculator:** Adjusted transition animations for hypo grade calculator to be smoother and more interactive.

# Closed Beta 0.0.9

## 2018-11-03

### Improvements

* **Hypo Grade Calculator:** Transition animations have been added to the hypo grade calculator.
* **GPA Calculator:** Added support for proper calculation in second semester.

# Closed Beta 0.0.8.3

## 2018-11-02

### Bug Fixes

* **GPA Calculator:** Made sure that a value is returned even when no courses have grades.

# Closed Beta 0.0.8.2

## 2018-11-02

### Improvements

* **Analytics:** Added extension version to analytics data.

# Closed Beta 0.0.8.1

## 2018-11-02

### Bug Fixes

* **Hypo Grade Calculator:** Fixed strange hover shadows on the hypo grade calculator window.

# Closed Beta 0.0.8

## 2018-11-02

### Features

* **Hypo Grade Calculator:** Added the ability to calculate GPA with hypothetical grades.

# Closed Beta 0.0.7

## 2018-10-30

### Bug Fixes

* **Analytics:** Fixed a bug that made it impossible to disable analytics

### Improvements

* **3rd Party Libraries:** jQuery replaced with minified version
* **Reliability**: Various slight changes for reliability

### Miscellaneous

* **Credits:** Credits added to options page

# Closed Beta 0.0.6.2

## 2018-10-27

### Bug Fixes

* **Analytics:** Fixed a bug that could result in unintended resets of the analytics id.

# Closed Beta 0.0.6.1

## 2018-10-27

### Improvements

* **Chromium:** Improved Chromium compatability.

# Closed Beta 0.0.6

## 2018-10-26

### Changes

* **Extension Name Change:** Renamed from SAS Powerschool FF to SAS Powerschool Extension in preperation for release.
### Features
 * **Analytics:** An analytics system was added.

# Closed Beta 0.0.5

## 2018-10-25

### Features

* **Class Page:** Added tooltip for final percent cutoffs

# Closed Alpha 0.0.4

## 2018-09-26

### Bug Fixes

* **GPA Calculator:** The GPA calculator now rounds to the nearest hundredth place.

### Improvements

* **Code Cleanups**

# Closed Alpha 0.0.3

## 2018-09-25

### Features

* **Class Page:** Final percent can now be viewed in class pages.

### Improvements

* **Code Cleanups**

# Closed Alpha 0.0.2

## 2018-09-25

### Miscellaneous

* **Name:** Name changed from SAS-Powerschool-FF to SAS Powerschool FF

# Closed Alpha 0.0.1

## 2018-09-25

### Features

* **GPA Calculator:** Semester GPA can be viewed on the main page.
