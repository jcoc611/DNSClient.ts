'use strict';

import { BufferIO } from '../BufferIO';

// OPT   = 41,   //  meta rr for extended dns
export interface IOPT {
	opCode: number;
	opLength: number;
	opData: any;
};

export interface IRDataOPT {
	options: IOPT[];
};

export class RDataOPT {
	static toBuffer(writer: BufferIO, data: IRDataOPT) {
		// TODO
	}

	static fromBuffer(reader: BufferIO, length: number): IRDataOPT {
		// TODO
		let record: IRDataOPT = {
			options: []
		};

		return record;
	}
};
