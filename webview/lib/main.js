'use strict';

/* eslint-env browser */
/* eslint-disable no-alert */

const { convert, upload_pm, fetch_pm } = require('../../dist/src/bridge');


// Just a small goody for the home page...
// eslint-disable-next-line no-unused-vars
function printDate() {
    console.log('GUIO')
    const now = new Date(document.lastModified);
    let textout = now.getDate() + ' ';
    const month = now.getMonth();
    if (month === 0) textout += 'January';
    if (month === 1) textout += 'February';
    if (month === 2) textout += 'March';
    if (month === 3) textout += 'April';
    if (month === 4) textout += 'May';
    if (month === 5) textout += 'June';
    if (month === 6) textout += 'July';
    if (month === 7) textout += 'August';
    if (month === 8) textout += 'September';
    if (month === 9) textout += 'October';
    if (month === 10) textout += 'November';
    if (month === 11) textout += 'December';
    textout += ', ' + now.getFullYear();
    return textout;
}


window.addEventListener('load', () => {
    document.getElementById('date').textContent = printDate();
    document.getElementById('pm_url').addEventListener('change', fetch_pm);
    // document.getElementById('pep_url').addEventListener('change', get_pep);
    document.getElementById('process').addEventListener('click', convert);
    document.getElementById('upload_pm').addEventListener('change', upload_pm);
    // document.getElementById('save').addEventListener('click', save);
});
