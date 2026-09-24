import {BlockList, isIPv4} from 'net';
import {IncomingHttpHeaders} from 'http';

// Comma-separated CIDRs allowed to read /metrics. Unset means nobody can.
export function metricsAllowList(cidrs: string | undefined): BlockList {
    const list = new BlockList();

    for (const cidr of (cidrs ?? '').split(',').map((c) => c.trim()).filter(Boolean)) {
        const [address, prefix] = cidr.split('/');
        list.addSubnet(address, parseInt(prefix, 10), isIPv4(address) ? 'ipv4' : 'ipv6');
    }

    return list;
}

// The tunnel boxes sit on the LAN, so a LAN source alone could still be a public request relayed by cloudflared.
export function isMetricsRequestAllowed(allowList: BlockList, ip: string, headers: IncomingHttpHeaders): boolean {
    if (headers['cf-connecting-ip'] || headers['cf-ray']) {
        return false;
    }

    const address = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

    return allowList.check(address, isIPv4(address) ? 'ipv4' : 'ipv6');
}
