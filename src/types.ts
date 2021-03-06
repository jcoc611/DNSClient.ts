'use strict';

import { BufferIO } from './BufferIO';
import { IHeader, IMessage, IQuestion, IResourceRecord, RecordType } from './interfaces';
import { ResourceRecordHandlers } from './resourceRecords';

// Based on https://github.com/song940/node-dns
// Node-dns with Copyright (c) 2016 lsong - MIT License


/**
 * [Header description]
 * @param {[type]} options [description]
 * @docs https://tools.ietf.org/html/rfc1035#section-4.1.1
 */
class DnsHeader {
	/**
	 * [parse description]
	 * @param  {[type]} buffer [description]
	 * @return {[type]}        [description]
	 * @docs https://tools.ietf.org/html/rfc1035#section-4.1.1
	 */
	static fromBuffer(reader: BufferIO): IHeader {
		let header: IHeader = {
			id     : reader.readUInt(16),
			qr     : Boolean( reader.readUInt(1) ),
			opcode : reader.readUInt(4),
			aa     : Boolean( reader.readUInt(1) ),
			tc     : Boolean( reader.readUInt(1) ),
			rd     : Boolean( reader.readUInt(1) ),
			ra     : Boolean( reader.readUInt(1) ),
			z      : reader.readUInt(3) && 0,
			rcode  : reader.readUInt(4),
			qdcount: reader.readUInt(16),
			ancount: reader.readUInt(16),
			nscount: reader.readUInt(16),
			arcount: reader.readUInt(16),
		};

		return header;
	};

	/**
	 * [toBuffer description]
	 * @return {[type]} [description]
	 */
	static toBuffer(writer: BufferIO, header: IHeader) {
		writer.writeUInt(header.id        , 16);
		writer.writeUInt(header.qr ? 1 : 0, 1);
		writer.writeUInt(header.opcode    , 4);
		writer.writeUInt(header.aa ? 1 : 0, 1);
		writer.writeUInt(header.tc ? 1 : 0, 1);
		writer.writeUInt(header.rd ? 1 : 0, 1);
		writer.writeUInt(header.ra ? 1 : 0, 1);
		writer.writeUInt(header.z         , 3);
		writer.writeUInt(header.rcode     , 4);
		writer.writeUInt(header.qdcount   , 16);
		writer.writeUInt(header.ancount   , 16);
		writer.writeUInt(header.nscount   , 16);
		writer.writeUInt(header.arcount   , 16);
	};
}

/**
 * [Packet description]
 * @param {[type]} data [description]
 * @docs https://tools.ietf.org/html/rfc1034
 * @docs https://tools.ietf.org/html/rfc1035
 *
 * <Buffer 29 64 01 00 00 01 00 00 00 00 00 00
 *       |-ID----------- HEADER ----------->|
 *
 *  03 77 77 77 01 7a 02 63 6e 00 00 01 00 01>
 *   <-W--W--W-----Z-----C--N>|<----------->|
 */
export class DnsMessage {

	/**
	 * [uuid description]
	 * @return {[type]} [description]
	 */
	static uuid(): number{
		return Math.floor(Math.random() * 1e5);
	};

	static fromBuffer(reader: BufferIO): IMessage {
		let header: IHeader = DnsHeader.fromBuffer(reader);
		let questions: IQuestion[] = [];
		let answers: IResourceRecord[] = [];
		let authorities: IResourceRecord[] = [];
		let additionals: IResourceRecord[] = [];

		for (let z = 0; z < header.qdcount; z++) {
			questions.push( DnsQuestion.fromBuffer(reader) );
		}

		for (let z = 0; z < header.ancount; z++) {
			answers.push( DnsResourceRecord.fromBuffer(reader) );
		}

		for (let z = 0; z < header.nscount; z++) {
			authorities.push( DnsResourceRecord.fromBuffer(reader) );
		}

		for (let z = 0; z < header.arcount; z++) {
			additionals.push( DnsResourceRecord.fromBuffer(reader) );
		}

		let message: IMessage = {
			header,
			questions,
			answers,
			authorities,
			additionals,
		};
		return message;
	};

	/**
	 * [toBuffer description]
	 * @return {[type]} [description]
	 */
	static toBuffer(writer: BufferIO, message: IMessage) {
		message.header.qdcount = message.questions  .length;
		message.header.ancount = message.answers    .length;
		message.header.nscount = message.authorities.length;
		message.header.arcount = message.additionals.length;
		DnsHeader.toBuffer(writer, message.header);

		message.questions.map( (q) => DnsQuestion.toBuffer(writer, q) );
		message.answers.map( (a) => DnsResourceRecord.toBuffer(writer, a) );
		message.authorities.map( (a) => DnsResourceRecord.toBuffer(writer, a) );
		message.additionals.map( (a) => DnsResourceRecord.toBuffer(writer, a) );
	}
}

/**
 * Question section format
 * @docs https://tools.ietf.org/html/rfc1035#section-4.1.2
 */
class DnsQuestion {

	/**
	 * [parse description]
	 * @param  {[type]} reader [description]
	 * @return {[type]}        [description]
	 */
	static fromBuffer(reader: BufferIO): IQuestion {
		var question: IQuestion = {
			name: DnsDomain.fromBuffer(reader),
			type: reader.readUInt(16),
			qClass: reader.readUInt(16),
		};
		return question;
	};

	static toBuffer(writer: BufferIO, question: IQuestion){
		DnsDomain.toBuffer(writer, question.name);
		writer.writeUInt(question.type,   16);
		writer.writeUInt(question.qClass, 16);
	};
}

/**
 * [encode_name description]
 * @param  {[type]} domain [description]
 * @return {[type]}        [description]
 */
export class DnsDomain {
  static COPY = 0xc0

  static fromBuffer(reader: BufferIO): string {
		var name = [], prevOffset, len = reader.readUInt(8);

		while (len) {
			if( (len & DnsDomain.COPY) === DnsDomain.COPY ) {
				len -= DnsDomain.COPY;
				len = len << 8;
				var pos = len + reader.readUInt(8);
				if (!prevOffset) {
					prevOffset = reader.getOffsetBits();
				}
				reader.seek(pos * 8);
				len = reader.readUInt(8);
				continue;
			} else {
				var part = '';
				while (len--) {
					part += String.fromCharCode( reader.readUInt(8) );
				}
				name.push(part);
				len = reader.readUInt(8);
			}
		}

		if (prevOffset) {
			reader.seek(prevOffset);
		}

		return name.join('.');
	}

	static toBuffer(writer: BufferIO, domain: string) {
		// TODO: domain name compress
		let labels = domain.split('.');

		for (let z = 0; z < labels.length; z++) {
			if (labels[z] === '') {
				continue;
			}

			writer.writeUInt(labels[z].length, 8);

			for (let i = 0; i < labels[z].length; i++) {
				writer.writeUInt(labels[z].charCodeAt(i), 8);
			}
		}

		writer.writeUInt(0, 8);
	}

	static getLength(domain: string) {
		// TODO: domain name compress
		let labels = domain.split('.');
		let length = 8;

		for (let z = 0; z < labels.length; z++) {
			if (labels[z] === '') {
				continue;
			}
			length += 8 * (labels[z].length + 1);
		}

		return length;
	}
};

/**
 * Resource record format
 * @docs https://tools.ietf.org/html/rfc1035#section-4.1.3
 */
class DnsResourceRecord {
	/**
	 * [parse description]
	 * @param  {[type]} reader [description]
	 * @return {[type]}        [description]
	 */
	static fromBuffer(reader: BufferIO): IResourceRecord {
		let name = DnsDomain.fromBuffer(reader);
		let type: RecordType = reader.readUInt(16);
		let recordClass = reader.readUInt(16);
		let ttl = reader.readUInt(32);
		let rdLength = reader.readUInt(16);
		let rdata = null;

		if (ResourceRecordHandlers[type]) {
			rdata = ResourceRecordHandlers[type].fromBuffer(reader, rdLength);
		} else {
			console.error('node-dns > unknown parser type: (%j)', type);
			reader.seek( reader.getOffsetBits() + (8 * rdLength) );
		}

		let resource: IResourceRecord = {
			name,
			type,
			class: recordClass,
			ttl,
			rdLength,
			rdata
		};

		return resource;
	}

	/**
	 * [encode description]
	 * @param  {[type]} resource [description]
	 * @param  {[type]} writer   [description]
	 * @return {[type]}          [description]
	 */
	static toBuffer(writer: BufferIO, resource: IResourceRecord) {
		DnsDomain.toBuffer(writer, resource.name);
		writer.writeUInt(resource.type,  16);
		writer.writeUInt(resource.class, 16);
		writer.writeUInt(resource.ttl,   32);

		if (ResourceRecordHandlers[resource.type]) {
			return ResourceRecordHandlers[resource.type].toBuffer(writer, resource);
		} else {
			console.error('node-dns > unknown encoder %s(%j)', resource.type, resource.type);
		}
	};
}
