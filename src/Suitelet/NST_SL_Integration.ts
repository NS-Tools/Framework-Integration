/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

/**
 * Suitelet to run integration tests for the NS Tools Framework
 *
 * Copyright 2016-2025 Explore Consulting
 * Copyright 2025-Present NS Tools Team
 *
 * See LICENSE file for additional information.
 */

import { file, format, record, search } from 'N';
import type { EntryPoints } from 'N/types';
import { CONSTANTS } from '../CONSTANTS';
import { AssemblyItemBase } from '../Framework/DataAccess/BaseRecords/AssemblyItemBase';
import { CustomerBase } from '../Framework/DataAccess/BaseRecords/CustomerBase';
import { InventoryItemBase } from '../Framework/DataAccess/BaseRecords/InventoryItemBase';
import { InvoiceBase } from '../Framework/DataAccess/BaseRecords/InvoiceBase';
import { ItemFulfillmentBase } from '../Framework/DataAccess/BaseRecords/ItemFulfillmentBase';
import { SalesOrderBase } from '../Framework/DataAccess/BaseRecords/SalesOrderBase';
import { LazyQuery, nsQueryResult2obj } from '../Framework/query';
import { getColumns } from '../Framework/queryAutoMapper';
import { LazySearch, nsSearchResult2obj } from '../Framework/search';
import * as BigNumber from '../Framework/thirdparty/optional/bignumber';
import { Seq } from '../Framework/thirdparty/optional/immutable';
import * as lodash from '../Framework/thirdparty/optional/lodash';
import * as moment from '../Framework/thirdparty/optional/moment';
import * as Logger from '../Framework/utility/Logger';
import { CustomerWithAlias } from '../Records/CustomerWithAlias';
import { TestType } from '../Records/TestType';

export = { onRequest: onRequest };

function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
	NST_SL_Integration.registerLogger();
	return NST_SL_Integration.onRequest(context);
}

/**
 * Suitelet to run integration tests for the NS Tools Framework
 *
 * @TODO: Split the tests into separate modules/files for easier long term maintenance
 */
namespace NST_SL_Integration {
	export const log = Logger.DefaultLogger;

	export function registerLogger() {
		Logger.autoLogMethodEntryExit(
			{ target: NST_SL_Integration.tests, method: /\w+/ },
			{
				withGovernance: true,
				withProfiling: true,
			},
		);
	}

	export function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
		const results: string[] = [];

		for (const testName in tests) {
			log.debug('Running Test', `Starting test: ${testName}`);

			try {
				const result = tests[testName]();
				results.push(`Test ${testName} Passed: ${JSON.stringify(result)}`);
			} catch (e) {
				log.error(`Test ${testName} Failed`, (e as Error).message);
				results.push(`Test ${testName} Failed ${(e as Error).message}`);
			}
		}

		if (CONSTANTS.LOG_FOLDER_ID !== -1) {
			// @TODO: Revamp the logging to capture more detailed logs rather than just test results
			const f = file.create({
				name: `NST_SL_Integration_Log_${new Date().toISOString()}.txt`,
				folder: CONSTANTS.LOG_FOLDER_ID,
				fileType: file.Type.PLAINTEXT,
				contents: results.join('\r\n'),
			});
			const fileId = f.save();

			log.debug('Log File Created', `Log file saved to file cabinet with internal id: ${fileId}`);
			results.push(`Log file saved to file cabinet with internal id: ${fileId}`);
		}

		return context.response.write(results.join('\n\n'));
	}

	export const tests = {
		testautoMapping: testautoMapping,
		testMappingAdvancedQuery: testMappingAdvancedQuery,
		testQueryParameter: testQueryParameter,
		testQueryPageSize: testQueryPageSize,
		testQueryPageSizeParameter: testQueryPageSizeParameter,
		testAutoLogging: testAutoLogging,
		testLoadingCustomerRecord: testLoadingCustomerRecord,
		testLoadingTransactionRecords: testLoadingTransactionRecords,
		testSublists: testSublists,
		testAliasDecorator: testAliasDecorator,
		testLoadingItems: testLoadingItems,
		testFieldTypes: testFieldTypes,

		/* Optional third party library tests */
		testLodash: testLodash,
		testBigNumber: testBigNumber,
		testMoment: testMoment,
		testImmutableSearch: testImmutableSearch,
	};

	function testautoMapping() {
		const sqlStr = `SELECT id, trandate FROM transaction WHERE id = 1000`;
		return getColumns(sqlStr);
	}

	function testMappingAdvancedQuery() {
		const sqlStr = `SELECT TOP 1 t.id, t.trandate as tdate,
                        (SELECT TOP 1 c.id FROM customer as c WHERE c.id = t.entity) as customerid,
                        TO_CHAR(t.trandate, 'MM/DD/YYYY'),
                        TO_CHAR(t.trandate, 'MM/DD/YYYY')                            as otherdate
                FROM transaction as t
                WHERE id = 1000 AND (SELECT TOP 1 c.id FROM customer as c WHERE c.id = t.entity ) IS NOT NULL`;
		return getColumns(sqlStr);
	}

	function testQueryParameter() {
		return Seq(
			LazyQuery.from(
				{
					query: `SELECT ID AS FOO FROM TRANSACTION WHERE recordType = ?`,
					params: ['invoice'],
				},
				10,
			),
		)
			.take(25)
			.map(nsQueryResult2obj)
			.toArray();
	}

	function testQueryPageSize() {
		return Seq(LazyQuery.from({ query: `SELECT ID AS FOO FROM TRANSACTION WHERE ROWNUM < 10` }, 750))
			.map(nsQueryResult2obj)
			.toArray();
	}

	function testQueryPageSizeParameter() {
		return Seq(
			LazyQuery.from(
				{
					query: `SELECT ID AS FOO FROM TRANSACTION WHERE recordType = ? AND ROWNUM < 10`,
					params: ['invoice'],
				},
				750,
			),
		)
			.map(nsQueryResult2obj)
			.toArray();
	}

	function testAutoLogging() {
		log.info('testAutoLogging', 'This is a test of the auto logging feature.');
		printTest('Hello world!');
		printNumberTest(55);
		return 'Auto logging test completed.';
	}

	function printTest(message: string): string {
		return `Message: ${message}`;
	}

	function printNumberTest(num: number): number {
		return num * 2;
	}

	function testLoadingCustomerRecord() {
		const customer = new CustomerBase(CONSTANTS.CUSTOMER_ID);

		return customer.toJSON();
	}

	function testLoadingTransactionRecords() {
		const order = new SalesOrderBase(CONSTANTS.SALES_ORDER_ID);
		const itemFulfillment = new ItemFulfillmentBase(CONSTANTS.ITEM_FULFILLMENT_ID);
		const invoice = new InvoiceBase(CONSTANTS.INVOICE_ID);

		return {
			order_id: order.id,
			item_fulfillment_id: itemFulfillment.id,
			invoice_id: invoice.id,
		};
	}

	function testSublists() {
		const order = new SalesOrderBase(CONSTANTS.SALES_ORDER_ID);
		log.debug('Sales Order Lines', `Sales Order has ${order.item.length} lines.`);

		let lineCount = 0;
		for (const line of order.item) {
			log.debug(`Line ${lineCount} Info`, `Item: ${line.item}, Quantity: ${line.quantity}, Rate: ${line.rate}`);
			lineCount++;
		}

		if (lineCount < 2) {
			log.error('testSublists FAILURE', 'Please use a sales order with at least two lines for the iterator symbol tests.');
		}

		order.item.useDynamicModeAPI = false;
		const itemSublit = order.item.toJSON();

		order.item.useDynamicModeAPI = true;
		const itemSublitDynamic = order.item.toJSON();

		const customer = new CustomerBase(CONSTANTS.CUSTOMER_ID);

		return {
			lineCount: lineCount,
			itemSublit: itemSublit,
			itemSublitDynamic: itemSublitDynamic,
			customerAddressBook: customer.addressbook.toJSON(),
		};
	}

	function testAliasDecorator() {
		const customer = new CustomerWithAlias(CONSTANTS.CUSTOMER_ID);
		log.debug('Alias Field Value', `Company name: ${customer.companyname} Value of my_alias: ${customer.my_alias}`);

		return {
			customer: customer.toJSON(),
		};
	}

	function testLoadingItems() {
		let assemblyItem: AssemblyItemBase | null = null;

		if (CONSTANTS.ASSEUMBLY_ITEM_ID !== -1) {
			assemblyItem = new AssemblyItemBase(CONSTANTS.ASSEUMBLY_ITEM_ID);
		}

		const inventoryItem = new InventoryItemBase(CONSTANTS.INVENTORY_ITEM_ID);

		return {
			inventoryItem: inventoryItem.toJSON(),
			assemblyItem: assemblyItem ? assemblyItem.toJSON() : null,
		};
	}

	function testLodash() {
		const array = [1, 2, 3, 4, 5];
		const reversedArray = lodash.reverse([...array]);
		log.debug('Lodash Reverse', `Original: ${array}, Reversed: ${reversedArray}`);

		return {
			original: array,
			reversed: reversedArray,
		};
	}

	function testBigNumber() {
		const num1 = new BigNumber('123456789.123456789');
		const num2 = new BigNumber('987654321.987654321');
		const sum = num1.plus(num2);

		log.debug('BigNumber Sum', `Num1: ${num1.toString()}, Num2: ${num2.toString()}, Sum: ${sum.toString()}`);

		return {
			num1: num1.toString(),
			num2: num2.toString(),
			sum: sum.toString(),
		};
	}

	function testMoment() {
		const d = new Date();
		const momentDate = moment(d);

		return momentDate.format('YYYY-MM-DD HH:mm:ss');
	}

	function testImmutableSearch() {
		return Seq(
			LazySearch.from(
				search.create({
					type: search.Type.CUSTOMER,
					filters: [['companyname', search.Operator.STARTSWITH, 'e']],
					columns: ['companyname', 'phone', 'firstname', 'lastname'],
					// as any below because two physically separate declarations of N/search (one referenced by LazySearch.from() expected parameters,
					// the other being the argument value created by search.create() here in this script.
					// are viewed as incompatible by TS
				}),
				2,
			),
		)
			.map(nsSearchResult2obj<{ foo: string }>())
			.toArray();
	}

	function testFieldTypes() {
		let record = getTestTypeRecord();

		if (!record) {
			record = new TestType(createTestTypeRecord());
		}

		record.custrecord_nst_test_type_checkbox = Math.random() <= 0.5;
		record.custrecord_nst_test_type_currency = 654.32;
		record.custrecord_nst_test_type_decimal = 654.321;
		record.custrecord_nst_test_type_integer = 321;
		record.custrecord_nst_test_type_percent = 0.25;
		record.custrecord_nst_test_type_freeform_text = 'This is an updated test string.';
		record.custrecord_nst_test_type_phone = format.format({
			type: format.Type.PHONE,
			value: '555-987-6543',
		});
		record.custrecord_nst_test_type_email = 'jane@doe.com';
		record.custrecord_nst_test_type_customer_select = CONSTANTS.CUSTOMER_ID;
		record.custrecord_nst_test_type_customer_multi = [CONSTANTS.CUSTOMER_ID, CONSTANTS.CUSTOMER_ID2];

		const d = record.custrecord_nst_test_type_date;
		log.debug('Original Date', `Date before modification: ${d.toISOString()}`);
		d.setDate(d.getDate() + 1);
		record.custrecord_nst_test_type_date = d;
		log.debug('Modified Date', `Date after modification: ${record.custrecord_nst_test_type_date.toISOString()}`);

		const d2 = record.custrecord_nst_test_type_datetime;
		log.debug('Original DateTime', `DateTime before modification: ${d2.toISOString()}`);
		d2.setHours(d2.getHours() + 1);
		record.custrecord_nst_test_type_datetime = d2;
		log.debug('Modified DateTime', `DateTime after modification: ${record.custrecord_nst_test_type_datetime.toISOString()}`);
		
		record.save();
		return record.toJSON();
	}

	function getTestTypeRecord(): TestType | null {
		const searchResult = search
			.create({
				type: TestType.recordType(),
				filters: [],
				columns: [],
			})
			.run()
			.getRange({ start: 0, end: 1 });

		if (searchResult.length > 0) {
			return new TestType(searchResult[0].id);
		}

		return null;
	}

	function createTestTypeRecord(): number {
		const testRecord = record.create({
			type: TestType.recordType(),
		});

		testRecord.setValue({
			fieldId: 'name',
			value: 'NST Test Type Record',
		})

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_checkbox',
			value: true,
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_currency',
			value: 1234.56,
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_customer_select',
			value: CONSTANTS.CUSTOMER_ID,
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_customer_multi',
			value: [CONSTANTS.CUSTOMER_ID],
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_date',
			value: new Date(),
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_datetime',
			value: new Date(),
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_freeform_text',
			value: 'This is a test string.',
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_decimal',
			value: 123.456,
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_integer',
			value: 123,
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_percent',
			value: 0.15,
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_phone',
			value: format.format({
				type: format.Type.PHONE,
				value: '555-123-4567',
			}),
		});

		testRecord.setValue({
			fieldId: 'custrecord_nst_test_type_email',
			value: 'john@doe.com',
		});

		return testRecord.save();
	}
}
