'use strict';

import { RecordType } from '../interfaces';

import { RDataA, RDataNS, RDataCNAME, RDataSOA, RDataMX, RDataTXT } from './standard';
import { RDataOPT } from './edns';

/**
 * Map of record types to buffer handlers
 * @var {[key: RecordType]: class}
 */
export const ResourceRecordHandlers: {[key in RecordType]?: any} = {
	[RecordType.A]: RDataA,
	[RecordType.NS]: RDataNS,
	// [RecordType.MD]: RDataMD,
	// [RecordType.MF]: RDataMF,
	[RecordType.CNAME]: RDataCNAME,
	[RecordType.SOA]: RDataSOA,
	// [RecordType.MB]: RDataMB,
	// [RecordType.MG]: RDataMG,
	// [RecordType.MR]: RDataMR,
	// [RecordType.NULL]: RDataNULL,
	// [RecordType.WKS]: RDataWKS,
	// [RecordType.PTR]: RDataPTR,
	// [RecordType.HINFO]: RDataHINFO,
	// [RecordType.MINFO]: RDataMINFO,
	[RecordType.MX]: RDataMX,
	[RecordType.TXT]: RDataTXT,

	// Extensions
	[RecordType.OPT]: RDataOPT,
};
