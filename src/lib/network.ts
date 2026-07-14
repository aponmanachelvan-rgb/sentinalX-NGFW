const ipv4Octet = '(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)';
const ipv4Pattern = new RegExp(`^(?:${ipv4Octet})(?:\.(?:${ipv4Octet})){3}$`);
const cidrPattern = new RegExp(
  `^(?:${ipv4Octet})(?:\.(?:${ipv4Octet})){3}\/(?:[0-9]|[1-2][0-9]|3[0-2])$`,
);

export function isValidIpv4OrCidr(value: string): boolean {
  const normalized = value.trim();

  if (!normalized) {
    return true;
  }

  return ipv4Pattern.test(normalized) || cidrPattern.test(normalized);
}
