# DNSClient.ts

A reference implementation non-native DNS Client in TypeScript for Node.js.

**Not production ready.** In any case, you should use the native DNS clients
on production applications. Other than being more heavily-scrutinized, they have
major perf benefits.

# Usage
First, install the dependencies `npm install`
Then, you can do queries like so:
```javascript
import { DNSClient } from './src/DNSClient';
import { UDPTransport } from './src/transports/UDPTransport';

let client = new DNSClient(new UDPTransport('1.1.1.1'));
let msg = await client.query({
    name: 'google.com',
    type: RecordType.A,
    qClass: RecordClass.IN
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
