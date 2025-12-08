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
import * as LogManager from '../Framework/Logger';
import { nsSearchResult2obj } from '../Framework/search';
import { CONSTANTS } from '../CONSTANTS';

export const getInputData = NST_MR_Auto_Search_Integration.getInputData;
export const map = NST_MR_Auto_Search_Integration.map;
export const reduce = NST_MR_Auto_Search_Integration.reduce;
export const summarize = NST_MR_Auto_Search_Integration.summarize;

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
        return search.create({
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
        });
    }

    export function map(context: EntryPoints.MapReduce.mapContext) {
        const result = nsSearchResult2obj<SearchResult>(JSON.parse(context.value));

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
