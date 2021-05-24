var moment = require('moment');
var parseUtil = require('./util');
var parse = require('csv-parse/lib/sync');
var fieldMapping = {
    SalesDate: 0,
    SalesLocation: 1,
    TransactionID: 4,
    GrossAmount: 6,
    Fee: 7,
    NetAmount: 8,
    TransactionType: 9,
    FirstName: 14,
    LastName: 15,
    Message: 16
};
module.exports = {
    /**
     * Parses a csv file from vipps reports
     * @param {Buffer} report A file buffer, from a csv comma seperated file
     * @return {Object} An object with a min- and maxDate field, representing the minimum and maximum date from the provided transactions, and an array of transactions in the field transaction
     */
    parseReport: function (report) {
        var reportText = report.toString();
        try {
            var data = parse(reportText, { delimiter: ';', bom: true, skip_empty_lines: true });
        }
        catch (ex) {
            console.error("Using semicolon delimiter failed, trying comma.");
            try {
                var data = parse(reportText, { delimiter: ',', bom: true, skip_empty_lines: true });
            }
            catch (ex) {
                console.error("Using comma delimiter failed.");
                console.error("Parsing vipps failed.");
                console.error(ex);
                return false;
            }
        }
        var currentMinDate = null;
        var currentMaxDate = null;
        var transactions = data.reduce(function (acc, dataRow) {
            var transaction = buildTransactionFromArray(dataRow);
            if (transaction == false)
                return acc;
            if (transaction.date.toDate() < currentMinDate || currentMinDate == null)
                currentMinDate = transaction.date.toDate();
            if (transaction.date.toDate() > currentMaxDate || currentMaxDate == null)
                currentMaxDate = transaction.date.toDate();
            acc.push(transaction);
            return acc;
        }, []);
        return {
            minDate: currentMinDate,
            maxDate: currentMaxDate,
            transactions: transactions
        };
    },
};
function buildTransactionFromArray(inputArray) {
    if (inputArray[fieldMapping.TransactionType] !== "Salg")
        return false;
    var transaction = {
        date: moment(inputArray[fieldMapping.SalesDate], "DD.MM.YYYY"),
        location: inputArray[fieldMapping.SalesLocation],
        transactionID: inputArray[fieldMapping.TransactionID],
        amount: Number(inputArray[fieldMapping.GrossAmount].replace(/,/g, '.').replace(/\s/g, '')),
        name: inputArray[fieldMapping.FirstName] + " " + inputArray[fieldMapping.LastName],
        message: inputArray[fieldMapping.Message],
        KID: parseUtil.extractKID(inputArray[fieldMapping.Message])
    };
    return transaction;
}
