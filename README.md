## Running with Docker

In order for the ping utility to work as intended, the running Docker daemon
should have IPv6 support. See how to enable IPv6 container networking in [the
Docker networking user guide](https://docs.docker.com/engine/userguide/networking/default_network/ipv6/#how-ipv6-works-on-docker)

Additionally, the system that this program runs on requires a ping utility
that supoorts both IPv4 and IPv6 in the same program. Distros where the
utility is split up into `ping` and `ping6` are not currently supported for
IPv6 monitored hosts.

```
$ docker run --network host
```

## Docker
### Build image


