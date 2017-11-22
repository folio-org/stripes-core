const domainToPath = {
  items: 'inventory',
  instances: 'inventory',
};

/**
 * Given the domain portion of a link from a notification, map it to the
 * path the corresponding application is deployed to. Under most circumstances
 * this is the same as the domain, but it may be overridden by an entry in
 * the domainToPath table, which should eventually be replaced with a value
 * pulled from an app registry, but we haven't built an app registry yet.
 *
 * @param {string} domain string
 */
export default function mapDomainToPath(domain) {
  return (domainToPath[domain] ? domainToPath[domain] : domain);
}
