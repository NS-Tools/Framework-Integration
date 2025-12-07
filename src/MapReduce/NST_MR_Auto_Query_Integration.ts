/**
 * Suitelet to run integration tests for the NS Tools Framework
 * 
 * Copyright 2016-2025 Explore Consulting
 * Copyright 2025-Present NS Tools Team
 *
 * See LICENSE file for additional information.
 * 
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

import type { EntryPoints } from 'N/types';
import { query } from 'N';
import * as LogManager from '../Framework/Logger';
import { getColumns, mapQueryMRResults } from '../Framework/queryAutoMapper';
import { CONSTANTS } from 'src/CONSTANTS';

const log = LogManager.DefaultLogger;
LogManager.autoLogMethodEntryExit(
    { target: NST_MR_Auto_Query_Integration, method: /\w+/ },
    {
        withProfiling: true,
        logLevel: LogManager.logLevel.debug
    }
)

namespace NST_MR_Auto_Query_Integration {
    interface QueryResult {
        id: number;
        foo: string;
        bar: string;
        trandate: string;
        test: string;
        lastcheck: number;
    }

    const queryStr = `SELECT TOP 1 
            t.id, 
            CASE 
                WHEN t.trandate > SYSDATE - 30 THEN 'Recent'
                WHEN t.trandate > SYSDATE - 90 THEN 'Moderate'
                ELSE 'Old'
            END as foo,
            (SELECT TOP 1 c.id FROM customer as c WHERE c.id = t.entity) as bar,
            TO_CHAR(t.trandate, 'MM/DD/YYYY'),
            TO_CHAR(t.trandate, 'MM/DD/YYYY') as test,
            COUNT(t.runtest) as lastcheck
        FROM transaction as t
        WHERE id IN (?, ?, ?)
            AND (SELECT TOP 1 c.id FROM customer as c WHERE c.id = t.entity ) IS NOT NULL`;


    export function getInputData(context: EntryPoints.MapReduce.getInputDataContext) {
        return query.runSuiteQL({
            query: queryStr,
            params: [CONSTANTS.CUSTOMER_ID]
        });
    }

    export function map(context: EntryPoints.MapReduce.mapContext) {
		const columns = getColumns(queryStr);
        const result = mapQueryMRResults<QueryResult>(JSON.parse(context.value), columns);

        log.debug('Mapped Result', result);
    }

    export function reduce(context: EntryPoints.MapReduce.reduceContext) {}

    export function summarize(context: EntryPoints.MapReduce.summarizeContext) {
        log.debug('Map/Reduce Summary', {
            usageConsumed: context.usage,
            yields: context.yields,
            inputSummary: context.inputSummary,
            mapSummary: context.mapSummary,
            reduceSummary: context.reduceSummary
        });
    }
}

export = {
    getInputData: NST_MR_Auto_Query_Integration.getInputData,
    map: NST_MR_Auto_Query_Integration.map,
    reduce: NST_MR_Auto_Query_Integration.reduce,
    summarize: NST_MR_Auto_Query_Integration.summarize
};
