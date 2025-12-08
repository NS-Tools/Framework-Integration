/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

/**
 * Suitelet to run integration tests for the NS Tools Framework
 * 
 * Copyright 2016-2025 Explore Consulting
 * Copyright 2025-Present NS Tools Team
 *
 * See LICENSE file for additional information.
 */

import type { EntryPoints } from 'N/types';
import { search } from 'N';
import { LazySearch } from '../Framework/search';
import * as LogManager from '../Framework/Logger';
import { nsSearchResult2obj } from '../Framework/search';
import { CONSTANTS } from '../CONSTANTS';

export = {
    getInputData: NST_MR_Auto_Search_Integration.getInputData,
    map: NST_MR_Auto_Search_Integration.map,
    reduce: NST_MR_Auto_Search_Integration.reduce,
    summarize: NST_MR_Auto_Search_Integration.summarize,
};

namespace NST_MR_Auto_Search_Integration {
    const log = LogManager.DefaultLogger;
    LogManager.autoLogMethodEntryExit(
        { target: NST_MR_Auto_Search_Integration, method: /\w+/ },
        {
            withProfiling: true,
            logLevel: LogManager.logLevel.debug
        }
    );

    interface SearchResult {
        id: number;
        companyname: string;
        email: string;
        phone: string;
        datecreated: string;
        lastmodifieddate: string;
    }

    export function getInputData(context: EntryPoints.MapReduce.getInputDataContext) {
        log.debug('Getting Input Data');
        const results = [];
        const mySearch = LazySearch.from(
            search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['internalid', 'is', CONSTANTS.CUSTOMER_ID]
                ],
                columns: [
                    'internalid',
                    'companyname',
                    'email',
                    'phone',
                    'datecreated',
                    'lastmodifieddate'
                ]
            })
        );
    
        for (const result of mySearch) {
            results.push(nsSearchResult2obj<SearchResult>()(result));
        }

        return results;
    }

    export function map(context: EntryPoints.MapReduce.mapContext) {
        log.debug('Map Context Value', context.value);
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
