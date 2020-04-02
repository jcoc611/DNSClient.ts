'use strict';

import Transport from "./Transport";
import { IMessage } from "../interfaces";
import { BufferIO } from "../BufferIO";
import { DnsMessage } from "../types";

import * as tls from 'tls';

export default class TLS extends Transport {
	public send(msgData: IMessage): Promise<IMessage> {
		let buf = Buffer.alloc(512, 0, "binary");
		let writer = new BufferIO(buf);

		return new Promise((resolve, reject) => {
			let bufResponse = Buffer.alloc(0, 0, 'binary');
			DnsMessage.toBuffer(writer, msgData);
			const socket = tls.connect(853, this.resolverAddress, {}, () => {
				let offsetBytes = ~~(writer.getOffsetBits() / 8);

				let lenBuf = Buffer.alloc(2, 0, "binary");
				lenBuf.writeInt16BE(offsetBytes, 0);

				socket.write(Buffer.concat([lenBuf, buf]), (err) => {
					if (err) {
						console.error(err)
					}
				});
			});
			socket.on('data', (msg: Buffer) => {
				bufResponse = Buffer.concat([ bufResponse, msg ]);
			});

			socket.on('error', (err) => console.error(err));
			socket.on('close', () => {
				let reader = new BufferIO(bufResponse);
				reader.readUInt(16); // Reads TCP two-byte message length
				try{
					resolve( DnsMessage.fromBuffer(reader) );
				}catch (err){
					reject(bufResponse.toString('utf8'));
				}
			});
		});
	}
}