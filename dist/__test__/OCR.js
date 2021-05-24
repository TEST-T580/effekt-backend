// External
var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = (chai.expect);
var fs = require('fs');
// Internal
var OCR = require('../custom_modules/parsers/OCR.js');
var sampleOCRfile = fs.readFileSync('__test__/data/ocr_test.ocr').toString("utf8");
var noTransactionOCRFile = fs.readFileSync('__test__/data/ocr_no_valid_records.ocr').toString("utf8");
var sampleOCRline = "NY091330000000022011700000000000000000000000100000000000000000000012345678000000";
var sampleOCRnextliner = "NY091331000000800003233427974208710000000061119150623218380000000000000000000000";
// Tests for Generate() in KID.js
describe('OCR', function () {
    describe('OCR parse', function () {
        it('parse should be a function', function () {
            expect(OCR.parse).to.be.a('function');
        });
        it('parse should return an array', function () {
            expect(OCR.parse(sampleOCRfile)).to.be.a('array');
        });
        it('when no interesting transaction in file, should return empty array', function () {
            expect(OCR.parse(noTransactionOCRFile).length).to.equal(0);
        });
    });
    describe('OCR parse line', function () {
        it('should be a function', function () {
            expect(OCR.parseLine).to.be.a('function');
        });
        var transaction = OCR.parseLine(sampleOCRline, sampleOCRnextliner);
        it('should return a transaction object', function () {
            expect(transaction).to.be.an('object');
            expect(transaction).to.have.property('amount');
            expect(transaction).to.have.property('KID');
            expect(transaction).to.have.property('date');
            expect(transaction).to.have.property('transactionID');
            expect(transaction.amount).to.be.a('number');
            expect(transaction.KID).to.be.a('number');
            expect(transaction.date).to.be.a('date');
            expect(transaction.transactionID).to.be.a('string');
        });
        describe('transaction object tests', function () {
            it('should be correct date', function () {
                expect(transaction.date).to.equalTime(new Date(2017, 0, 22));
            });
            it('should be correct kid', function () {
                expect(transaction.KID).to.equal(12345678);
            });
            it('should be correct amount', function () {
                expect(transaction.amount).to.equal(100);
            });
            it('should have correct external reference', function () {
                expect(transaction.transactionID).to.equal("220117.7974208718");
            });
        });
    });
    /*
    describe('Parses sample OCR file', () => {
        it('Parses sample file correctly', async () => {
            let filecontents = fs.readFileSync('test/data/ocr/TBOC2072.DAT').toString("utf8")
            let transactions = OCR.parse(filecontents)

            expect(transactions.length).to.be.equal(2)
            expect(transactions[0].KID).to.be.equal(47914510)
            expect(transactions[0].amount).to.be.equal(5000)
        })
    })
    */
});
