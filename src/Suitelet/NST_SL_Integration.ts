/*
* Copyright 2016-2025 Explore Consulting
* Copyright 2025-Present NS Tools Team
*
* See LICENSE file for additional information.
*/

import { search } from 'N';
import type { EntryPoints } from 'N/types';
import { CONSTANTS } from '../CONSTANTS';
import { CustomerBase } from '../Framework/DataAccess/BaseRecords/CustomerBase';
import { InventoryItemBase } from '../Framework/DataAccess/BaseRecords/InventoryItemBase';
import { AssemblyItemBase } from '../Framework/DataAccess/BaseRecords/AssemblyItemBase';
import { SalesOrderBase } from '../Framework/DataAccess/BaseRecords/SalesOrderBase';
import { ItemFulfillmentBase } from '../Framework/DataAccess/BaseRecords/ItemFulfillmentBase';
import { InvoiceBase } from '../Framework/DataAccess/BaseRecords/InvoiceBase';
import { FieldType } from '../Framework/DataAccess/FieldType';
import { Logger } from '../Framework/Logger';
import * as BigNumber from '../Framework/thirdparty/optional/bignumber';
import * as lodash from '../Framework/thirdparty/optional/lodash';
import * as moment from '../Framework/thirdparty/optional/moment';
import { getColumns } from '../Framework/queryAutoMapper';
import { LazySearch, nsSearchResult2obj } from '../Framework/search';
import { Seq } from '../Framework/thirdparty/optional/immutable';
import { LazyQuery, nsQueryResult2obj } from '../Framework/query';

const log = Logger.DefaultLogger;

/**
 * Suitelet to run integration tests for the NS Tools Framework
 * 
 * @TODO: Split the tests into separate modules/files for easier long term maintenance
 */
namespace NST_SL_Integration {
    export function onRequest(_context: EntryPoints.Suitelet.onRequestContext) {
        const results: string[] = [];

        for (const testName in tests) {
            log.debug('Running Test', `Starting test: ${testName}`);
            try {
                const result = tests[testName]();
                results.push(`Test ${testName} Passed: ${JSON.stringify(result)}`);
            } catch (e) {
                log.error(`Test ${testName} Failed`, (e as Error).message);
            }
        }
    }

    export const tests = {
        'testautoMapping': testautoMapping,
        'testMappingAdvancedQuery': testMappingAdvancedQuery,
        'testQueryParameter': testQueryParameter,
        'testQueryPageSize': testQueryPageSize,
        'testQueryPageSizeParameter': testQueryPageSizeParameter,
        'testAutoLogging': testAutoLogging,
        'testLoadingCustomerRecord': testLoadingCustomerRecord,
        'testLoadingTransactionRecords': testLoadingTransactionRecords,
        'testSublists': testSublists,
        'testAliasDecorator': testAliasDecorator,
        'testLoadingItems': testLoadingItems,

        /* Optional third party library tests */
        'testLodash': testLodash,
        'testBigNumber': testBigNumber,
        'testMoment': testMoment,
        'testImmutableSearch': testImmutableSearch,
    }

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
            LazyQuery.from({
                query: `SELECT ID AS FOO FROM TRANSACTION WHERE recordType = ? AND ROWNUM < 10`,
                params: ['invoice'],
            }, 750),
        )
        .map(nsQueryResult2obj)
        .toArray();
    }

    function testAutoLogging() {
        log.info('testAutoLogging', 'This is a test of the auto logging feature.');
        printTest('Hello world!')
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
            invoice_id: invoice.id
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
        }
    }

    function testAliasDecorator() {
        class CustomerWithAlias extends CustomerBase {
            @FieldType.alias('companyname')
            public my_alias: string;
        }

        const customer = new CustomerWithAlias(CONSTANTS.CUSTOMER_ID);
        log.debug('Alias Field Value', `Company name: ${customer.companyname} Value of my_alias: ${customer.my_alias}`);

        return {
            customer: customer.toJSON(),
        }
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
        }
    }

    function testLodash() {
        const array = [1, 2, 3, 4, 5];
        const reversedArray = lodash.reverse([...array]);
        log.debug('Lodash Reverse', `Original: ${array}, Reversed: ${reversedArray}`);

        return {
            original: array,
            reversed: reversedArray,
        }
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
        }
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
}

Logger.autoLogMethodEntryExit(
	{ target: NST_SL_Integration.tests, method: /\w+/ },
	{
		withGovernance: true,
		withProfiling: true,
	},
);

export const onRequest: EntryPoints.Suitelet.onRequest = NST_SL_Integration.onRequest;
