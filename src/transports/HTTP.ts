'use strict';

import Transport from "./Transport";
import { IMessage } from "../interfaces";
import { BufferIO } from "../BufferIO";
import { DnsMessage } from "../types";

import * as http2 from 'http2';

// HTTP is HTTP/2 as dictated by RFC 8484
// https://tools.ietf.org/html/rfc8484#section-5.2
export default class HTTP extends Transport {
	public send(msgData: IMessage): Promise<IMessage> {
		let buf: Buffer = Buffer.alloc(512, 0, "binary");
		let bufResponse: Buffer = Buffer.alloc(0, 0, "binary");
		let writer = new BufferIO(buf);

		return new Promise((resolve, reject) => {
			DnsMessage.toBuffer(writer, msgData);

			const client = http2.connect(this.resolverAddress);
			client.on('error', (err: Error) => reject(err));

			const req: http2.ClientHttp2Stream = client.request({
				[http2.constants.HTTP2_HEADER_PATH]: '/dns-query',
				[http2.constants.HTTP2_HEADER_SCHEME]: 'https',
				[http2.constants.HTTP2_HEADER_AUTHORITY]: 'cloudflare-dns.com',
				[http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_POST,
				[http2.constants.HTTP2_HEADER_ACCEPT]: 'application/dns-message',
				[http2.constants.HTTP2_HEADER_CONTENT_TYPE]: 'application/dns-message',
				[http2.constants.HTTP2_HEADER_CONTENT_LENGTH]: ~~(writer.getOffsetBits() / 8),
			});

			let status: string = '0';
			req.on('response', (headers, flags) => {
				for (const name in headers) {
					if (name === ':status')
						status = '' + headers[name];
					console.log(`${name}: ${headers[name]}`);
				}
			});

			req.setEncoding('binary');
			req.write(buf, 'binary', (error) => error && reject(error));
			req.on('data', (chunk) => {
				console.log(typeof(chunk), chunk);
				bufResponse = Buffer.concat([bufResponse, Buffer.from(chunk)]);
			});
			req.on('end', () => {
				if (status.startsWith('2'))
					resolve(DnsMessage.fromBuffer(new BufferIO(bufResponse)));
				else
					reject(`Failed with status ${status}, message:\n${bufResponse.toString('utf8')}`);
			});
			req.end();
		});
	}
}