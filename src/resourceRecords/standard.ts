'use strict';

import { DnsDomain } from '../types';
import { BufferIO } from '../BufferIO';

// A     = 1,   //  a host address
export interface IRDataA {
	address: string;
};

/**
 * A 32 bit Internet address.
 * @type {Object}
 * @docs https://tools.ietf.org/html/rfc1035#section-3.4.1
 */
export class RDataA {
	static toBuffer(writer: BufferIO, data: IRDataA) {
		var parts = data.address.split('.');
		writer.writeUInt(parts.length, 16);
		for (let i = 0; i < parts.length; i++) {
			writer.writeUInt(parseInt(parts[i], 10), 8);
		}
	}

	static fromBuffer(reader: BufferIO, length: number): IRDataA {
		let parts = [];
		while(length--){
			parts.push( reader.readUInt(8) );
		}

		let record: IRDataA = {
			address: parts.join('.'),
		};

		return record;
	}
};


// NS    = 2,   //  an authoritative name server
export interface IRDataNS {
	/** @var {string} nsDName a domain name specifying the authoritative name server host */
	nsDName: string;
};

/**
 * [NS description]
 * @type {Object}
 * @docs https://tools.ietf.org/html/rfc1035#section-3.3.11
 */
export class RDataNS {
	static fromBuffer(reader: BufferIO, length: number): IRDataNS {
		return {
			nsDName: DnsDomain.fromBuffer(reader),
		} as IRDataNS;
	}

	static toBuffer(writer: BufferIO, record: IRDataNS){
		writer.writeUInt(DnsDomain.getLength(record.nsDName), 16);
		DnsDomain.toBuffer(writer, record.nsDName);
	}
};


// CNAME = 5,   //  the canonical name for an alias
export interface IRDataCNAME {
	/** @var {string} domain  A <domain-name> which specifies the canonical or primary name for the
	 *  owner. The owner name is an alias. */
	domain: string;
}

/**
 * [CNAME description]
 * @type {Object}
 * @docs https://tools.ietf.org/html/rfc1035#section-3.3.1
 */
export class RDataCNAME {
	static fromBuffer(reader: BufferIO, length: number): IRDataCNAME {
		return {
			domain: DnsDomain.fromBuffer(reader),
		} as IRDataCNAME;
	}

	static toBuffer(writer: BufferIO, record: IRDataCNAME){
		writer.writeUInt(DnsDomain.getLength(record.domain), 16);
		DnsDomain.toBuffer(writer, record.domain);
	}
}


// SOA   = 6,   //  marks the start of a zone of authority
export interface IRDataSOA {
	/** @var {string} mName  The <domain-name> of the name server that was the original or primary
	 * source of data for this zone. */
	mName: string;

	/** @var {string} rName  A <domain-name> which specifies the mailbox of the person responsible
	 * for this zone. */
	rName: string;

	/** @var {uint32} serial  The unsigned 32 bit version number of the original copy of the zone.
	 * Zone transfers preserve this value.  This value wraps and should be compared using sequence
	 * space arithmetic. */
	serial: number;

	/** @var {int32} refresh  A 32 bit time interval before the zone should be refreshed. */
	refresh: number;

	/** @var {int32} retry  A 32 bit time interval that should elapse before a failed refresh
	 * should be retried. */
	retry: number;

	/** @var {int32} expire  A 32 bit time value that specifies the upper limit on the time
	 * interval that can elapse before the zone is no longer authoritative. */
	expire: number;

	/** @var {uint32} minimum  The unsigned 32 bit minimum TTL field that should be exported with
	 * any RR from this zone. */
	minimum: number;
};

/**
 * [SOA description]
 * @type {Object}
 * @docs https://tools.ietf.org/html/rfc1035#section-3.3.13
 */
export class RDataSOA {
	static fromBuffer(reader: BufferIO, length: number): IRDataSOA {
		return {
			mName:   DnsDomain.fromBuffer(reader),
			rName:   DnsDomain.fromBuffer(reader),
			serial:  reader.readUInt(32),
			refresh: reader.readUInt(32),
			retry:   reader.readUInt(32),
			expire:  reader.readUInt(32),
			minimum: reader.readUInt(32),
		} as IRDataSOA;
	}

	static toBuffer(writer: BufferIO, record: IRDataSOA) {
		var len = 0;
		len += DnsDomain.getLength(record.mName);
		len += DnsDomain.getLength(record.rName);
		len += (32 * 5) / 8;
		writer.writeUInt(len, 16);

		DnsDomain.toBuffer(writer, record.mName);
		DnsDomain.toBuffer(writer, record.rName);
		writer.writeUInt(record.serial,  32);
		writer.writeUInt(record.refresh, 32);
		writer.writeUInt(record.retry,   32);
		writer.writeUInt(record.expire,  32);
		writer.writeUInt(record.minimum, 32);
	}
};


// TODO: MB    = 7,   //  a mailbox domain name (EXPERIMENTAL)
// TODO: MG    = 8,   //  a mail group member (EXPERIMENTAL)
// TODO: MR    = 9,   //  a mail rename domain name (EXPERIMENTAL)
// TODO: NULL  = 10,  //  a null RR (EXPERIMENTAL)
// TODO: WKS   = 11,  //  a well known service description
// TODO: PTR   = 12,  //  a domain name pointer
// TODO: HINFO = 13,  //  host information
// TODO: MINFO = 14,  //  mailbox or mail list information

// MX    = 15,  //  mail exchange
export interface IRDataMX {
	/** @var {uint16} priority preference given to this RR, lower values preferred */
	priority: number;

	/** @var {string} exchange A domain name specifying the mail exchange server */
	exchange: string;
}

/**
 * [MX description]
 * @docs https://tools.ietf.org/html/rfc1035#section-3.3.9
 */
export class RDataMX {
	static toBuffer(writer: BufferIO, record: IRDataMX) {
		var len = DnsDomain.getLength(record.exchange);
		writer.writeUInt(len + 2, 16);
		writer.writeUInt(record.priority, 16);

		DnsDomain.toBuffer(writer, record.exchange);
	}

	static fromBuffer(reader: BufferIO, length: number): IRDataMX {
		let record: IRDataMX = {
			priority: reader.readUInt(16),
			exchange: DnsDomain.fromBuffer(reader),
		};

		return record;
	}
}


// TXT   = 16,  //  text strings
export interface IRDataTXT {
	/** @var {string} text  One or more <character-string>s */
	text: string;
};

/**
 * [SPF description]
 * @type {[type]}
 * @docs https://tools.ietf.org/html/rfc1035#section-3.3.14
 */
export class RDataTXT {
	static fromBuffer(reader: BufferIO, length: number): IRDataTXT {
		var parts = [];
		// text length
		length = reader.readUInt(8);
		while (length--) {
			parts.push(reader.readUInt(8));
		}

		return {
			text: Buffer.from(parts).toString('utf8'),
		} as IRDataTXT;
	}

	static toBuffer(writer: BufferIO, record: IRDataTXT) {
		let buffer = Buffer.from(record.text, 'utf8');
		// response length
		writer.writeUInt(buffer.length + 1, 16);
		// text length
		writer.writeUInt(buffer.length, 8);
		buffer.forEach( function(c) {
			writer.writeUInt(c, 8);
		});
	}
};


/// TODO EXTRA
export interface IRDataSRV {
	// TODO
	priority: number;
	weight: number;
	port: number;
	target: string;
}

export interface IRDataCAA {
	// TODO
}

export interface IRDataAAAA {};

/**
 * [AAAA description]
 * @type {Object}
 * @docs https://en.wikipedia.org/wiki/IPv6
 */
// export class RDataAAAA {
// 	static fromBuffer(reader: BufferIO, length: number) {
// 		var parts = [];
// 		while(length){
// 			length -= 2;
// 			parts.push(reader.readUInt(16));
// 		};
// 		this.address = parts.map(function(part){
// 			return part > 0 ? part.toString(16) : '';
// 		}).join(':');
// 	}

// 	static toBuffer(writer: BufferIO, record: IRDataAAAA) {
// 		var parts = record.address.split(':');
// 		writer.writeUInt(parts.length * 2, 16)
// 		parts.forEach(function(part){
// 		writer.writeUInt(parseInt(part, 16), 16)
// 		})
// 	}
// };

/**
 * [SRV description]
 * @type {Object}
 * @docs https://tools.ietf.org/html/rfc2782
 */
// class RDataSRV {
// 	static fromBuffer(reader: BufferIO, length: number): IRDataSRV {
// 		return {
// 			priority: reader.readUInt(16),
// 			weight:   reader.readUInt(16),
// 			port:     reader.readUInt(16),
// 			target:   DnsDomain.fromBuffer(reader),
// 		} as IRDataSRV
// 	}

// 	static toBuffer(writer: BufferIO, record: IRDataSRV) {
// 		writer.writeUInt(record.priority, 16)
// 		writer.writeUInt(record.weight  , 16)
// 		writer.writeUInt(record.port    , 16)
// 		writer.writeUInt(record.target  , 16)
// 	}
// };


// class RDataCAA {
// 	static toBuffer(writer: BufferIO, record: IRDataCAA) {
// 		writer.writeUInt(record.flags, 8)
// 		writer.writeUInt((record.tag.length), 8)
// 		var buffer = new Buffer(record.tag + record.value, 'utf8');
// 		buffer.forEach(function(c){
// 			writer.writeUInt(c, 8)
// 		})
// 	}
// }