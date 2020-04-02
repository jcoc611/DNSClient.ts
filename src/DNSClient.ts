import * as Types from './interfaces';
import Transport from './transports/Transport';
import HTTP from './transports/HTTP';
import UDP from './transports/UDP';
import TCP from './transports/TCP';
import TLS from './transports/TLS';

export interface DnsQueryOptions {};

export type BuiltinTransports = 'udp' | 'tcp' | 'tls' | 'http';
const transportImplementations : { [key in BuiltinTransports]: {new(rA: string): Transport} } = {
	'udp': UDP,
	'tcp': TCP,
	'tls': TLS,
	'http': HTTP,
};

export { Types, Transport };

export default class DNSClient {
	private transport: Transport;

	constructor(transport: Transport);
	constructor(transport: BuiltinTransports, resolverAddress: string);
	constructor(transport: Transport | BuiltinTransports, resolverAddress?: string) {
		if (typeof(transport) === 'string')
			this.transport = new transportImplementations[transport](resolverAddress!);
		else
			this.transport = transport;
	}

	query(question: Types.IQuestion, options: DnsQueryOptions = {}): Promise<Types.IMessage> {
		return this.queryMulti([ question ], options);
	}

	queryMulti(questions: Types.IQuestion[], options: DnsQueryOptions = {}): Promise<Types.IMessage> {
		let msgData: Types.IMessage = {
			header: {
				id: 0, // TODO
				qr: false,
				opcode: 0, // TODO support IQUERY and STATUS
				aa: false,
				tc: false, // TODO truncated support?
				rd: false, // TODO recursion support
				ra: false,
				z: 0,
				rcode: 0,
				qdcount: questions.length,
				ancount: 0,
				nscount: 0,
				arcount: 0,
			},
			questions: questions,
			answers: [],
			authorities: [],
			additionals: [],
		};

		return this.transport.send(msgData);
	}
};
