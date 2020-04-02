'use strict';

import Transport from "./Transport";
import { IMessage } from "../interfaces";
import { BufferIO } from "../BufferIO";
import { DnsMessage } from "../types";

import * as dgram from 'dgram';

export default class UDP extends Transport {
	send(msgData: IMessage): Promise<IMessage> {
		let buf = Buffer.alloc(512, 0, "binary");
		let writer = new BufferIO(buf);

		return new Promise((resolve, reject) => {
			const socket = dgram.createSocket("udp4");
			socket.on('message', (msg, rinfo) => {
				resolve( DnsMessage.fromBuffer(new BufferIO(msg)) );
			});

			socket.on('error', (err)=> console.error(err));
			socket.on('close', () => console.log('dns socket closed'));

			DnsMessage.toBuffer(writer, msgData);

			let offsetBytes = ~~(writer.getOffsetBits() / 8);
			socket.send(buf, 0, offsetBytes, 53, this.resolverAddress, (err) => {
				if (err) {
					console.error(err);
				}
			});
		});
	}
}