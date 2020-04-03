# DNSClient.ts

A reference implementation non-native DNS Client in TypeScript for Node.js.

**Not for production.** In any case, you should use the native DNS clients
on production applications. Other than being more heavily-scrutinized, they have
major perf benefits.

# Usage
Get the dependency using `npm install DNSClient.ts`

Then, you can do queries like so:
```TypeScript
import { DNSClient, Types } from 'DNSClient.ts';

// You may also use 'udp' and 'tls' as alternative transports
let client = new DNSClient('tcp', '1.1.1.1');
client.query({
    name: 'google.com',
    type: Types.RecordType.A,
    qClass: Types.RecordClass.IN
}).then( (response: Types.IMessage) => {
    console.log(response);
    /*
    Response Example
    {
        header: {
            id: 0, qr: true, opcode: 0, aa: false, tc: false, rd: false, ra: true,
            z: 0, rcode: 0, qdcount: 1, ancount: 1, nscount: 0, arcount: 0
        },
        questions: [{ name: 'google.com', type: 1, qClass: 1 }],
        answers: [{
            name: '', type: 1, class: 1, ttl: 116, rdLength: 4,
            rdata: { address: '172.217.14.238' }
        }],
        authorities: [],
        additionals: []
    }
    */
});
```

## RFCs and completion
Only those relevant to client implementations will be listed. Finding and adding
all of them will take some time.

### Basics
Core functionality and any internet-specific extensions.
| RFC        | Name           | Support  |
| ------------- |:-------------:| -----:|
| [1035](https://tools.ietf.org/html/rfc1035) | Domain Names — Implementation and Specification | ✅ |
| [6891](https://tools.ietf.org/html/rfc6891) | Extension Mechanisms for DNS (EDNS(0)) | TODO |

### Transport security
Securing the communication between client and server, as well as server-to-server.
| RFC        | Name           | Support  |
| ------------- |:-------------:| -----:|
| [7858](https://tools.ietf.org/html/rfc7858) | DNS over Transport Layer Security (TLS) | ✅ |
| [8484](https://tools.ietf.org/html/rfc8484) | DNS Queries over HTTPS (DoH) | in progress |

### Integrity
Validating and authenticating the responses of servers (DNSSEC). TODO.
