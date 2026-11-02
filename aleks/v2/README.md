# ALEKS Module Navigator V2

V2 is a separate Firefox extension for navigating a selected list of ALEKS
modules in order. It does not read or answer questions, submit work, or detect
whether a module has actually been completed. You complete and submit each
module yourself, then confirm **Module complete — open next**.

## Load the extension

1. In Firefox, open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Select `extension/manifest.json` from this `v2` folder.
4. Open the ALEKS course page that lists its modules and select the extension.
5. Select **Scan page**, review the detected links, and uncheck any module you
   do not want in the sequence.
6. Select **Start with first selected**. Complete the opened module yourself.
   When you are ready, open the extension and select
   **Module complete — open next**.

The scanner only recognizes visible ALEKS links whose labels contain
"module", "lesson", "topic", or "unit". A module is marked complete only when
its surrounding list item, card, or article visibly contains "completed" or
"mastered". Review the scan results; ALEKS page layouts may differ, and this
extension has not been tested against a live ALEKS account.

The selected sequence is stored locally in Firefox extension storage. Select
**Stop sequence** to clear it. The original extension remains unchanged in
`../extension`.
