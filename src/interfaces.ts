export enum RecordType {
	A     = 1,   //  a host address
	NS    = 2,   //  an authoritative name server
	MD    = 3,   //  a mail destination (Obsolete - use MX)
	MF    = 4,   //  a mail forwarder (Obsolete - use MX)
	CNAME = 5,   //  the canonical name for an alias
	SOA   = 6,   //  marks the start of a zone of authority
	MB    = 7,   //  a mailbox domain name (EXPERIMENTAL)
	MG    = 8,   //  a mail group member (EXPERIMENTAL)
	MR    = 9,   //  a mail rename domain name (EXPERIMENTAL)
	NULL  = 10,  //  a null RR (EXPERIMENTAL)
	WKS   = 11,  //  a well known service description
	PTR   = 12,  //  a domain name pointer
	HINFO = 13,  //  host information
	MINFO = 14,  //  mailbox or mail list information
	MX    = 15,  //  mail exchange
	TXT   = 16,  //  text strings

	// Extensions
	OPT   = 41,  //  additional options, metadata and extended rcodes
}

enum QuestionExraType {
	AXFR  = 252, //  A request for a transfer of an entire zone
	MAILB = 253, //  A request for mailbox-related records (MB, MG or MR)
	MAILA = 254, //  A request for mail agent RRs (Obsolete - see MX)
	ALL   = 255, //  A request for all records
}

export type QuestionType = RecordType | QuestionExraType;

export enum RecordClass {
	IN    = 1,   //  1 the Internet
	CS    = 2,   //  2 the CSNET class (obsolete)
	CH    = 3,   //  3 the CHAOS class
	HS    = 4,   //  4 Hesiod [Dyer 87]
}

enum QuestionExtraClass {
	ALL   = 255, // 255 Any class
}

export type QuestionClass = RecordClass | QuestionExtraClass;

export enum OPCode {
	QUERY = 0, // a standard query
	IQUERY = 1, // an inverse query
	STATUS = 2, //a server status request (STATUS)
	// 3-15	Reserved
}

export enum ResponseCode {
	OK = 0,        // No error condition
	FormatErr = 1, // Format error - bad request
	ServerErr = 2, // Server failure
	NotFound = 3,  // Name error - only from authoritative servers, means the domain was not found
	NotImpl = 4,   // Not Implemented - operation not supported
	Refused = 5,   // Refused - name server refuses to perform operation based on policy.
	// 6,-15 Reserved
}

/** @interface IHeader 72 bits/12 octet */
export interface IHeader {
	/** @var {uint16} id A 16 bit identifier for this request/response */
	id: number;

	/** @var {boolean} queryResponse Flag identifying a query (false) or a response (true) */
	qr: boolean;

	/**
	 * @var {uint4} opcode Identifies the kind of query.
	 *     0		is a standard query (QUERY)
	 *     1		is an inverse query (IQUERY)
	 *     2		is a server status request (STATUS)
	 *     3-15		reserved
	 */
	opcode: OPCode;

	/**
	 * @var {boolean} authoritativeAnswer Flag present in responses, which identifies whether the
	 *     responding name server is an authority for the domain name in question.
	 */
	aa: boolean;

	/** @var {boolean} truncated Flag to identify whether the message was truncated */
	tc: boolean;

	/**
	 * @var {boolean} recursionDesired Flag that directs the name server to pursue the query
	 *     recursively. Support for recursive queries is optional.
	 */
	rd: boolean;

	/**
	 * @var {boolean} recursionAvailable Flag set in a response to indicate whether recursion is
	 *     supported by the name server.
	 */
	ra: boolean;

	/** @var {uint3} z Reserved for future use. Must be zero */
	z: 0;

	/**
	 * @var {uint4} responseCode
	 *     0		No error condition
	 *     1		Format error - bad request
	 *     2		Server failure
	 *     3		Name error - only from authoritative servers, means the domain was not found
	 *     4		Not Implemented - operation not supported
	 *     5		Refused - name server refuses to perform operation based on policy.
	 *     6-15		Reserved
	 */
	rcode: number;

	/** @var {uint16} questionCount */
	qdcount: number;

	/** @var {uint16} answerCount */
	ancount: number;

	/** @var {uint16} nsCount the number of name server records in the authority section */
	nscount: number;

	/** @var {uint16} arCount the number of resource records in the additional records section */
	arcount: number;
};


export interface IQuestion {
	name: string;

	/** @var {int16} aType */
	type: QuestionType;

	/** @var {int16} qClass */
	qClass: QuestionClass;
}

export interface IResourceRecord {
	name: string;

	type: RecordType;

	class: RecordClass;

	ttl: number;

	rdLength: number;

	// rdata: RData;
	rdata: any;
}

interface DnsQueryOptions {
	recurse?: boolean;
}

export interface IMessage {
	header: IHeader;

	questions: IQuestion[];
	answers: IResourceRecord[];
	authorities: IResourceRecord[];
	additionals: IResourceRecord[];
}
