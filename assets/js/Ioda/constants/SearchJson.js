/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

const SearchJson = [
    {
        "name": "AS Rank",
        "organization": "CAIDA",
        "logo": "http://as-rank.caida.org/images/asrank-logo-letters.svg",
        "tags": [
            "topology",
            "geolocation"
        ],
        "entities": [
            {
                "id": "AS",
                "features": [
                    {
                        "id": "name",
                        "description": "name from WHOIS"
                    },
                    {
                        "id": "IPv4 rank",
                        "description": "number of ASs with larger customer cone"
                    },
                    {
                        "id": "IPv4 degree",
                        "description": "number of neighbors"
                    },
                    {
                        "id": "IPv4 customer cone",
                        "description": "number of ASs in it's customer cone"
                    }
                ]
            },
            {
                "id": "Organization",
                "features": [
                    {
                        "id": "name",
                        "description": "name from WHOIS"
                    },
                    {
                        "id": "IPv4 rank",
                        "description": "number of ASs with larger customer cone"
                    },
                    {
                        "id": "IPv4 degree",
                        "description": "number of neighbor ASes"
                    },
                    {
                        "id": "IPv4 customer cone",
                        "description": "number of AS in it's customer cone"
                    }
                ]
            },
            {
                "id": "AS Link IPv4",
                "features": [
                    {
                        "id": "relationship",
                        "description": "the type of business relationship"
                    }
                ]
            },
            {
                "id": "Country",
                "features": [
                    {
                        "id": "name",
                        "description": "from geonames"
                    },
                    {
                        "id": "languages",
                        "description": "spoken"
                    },
                    {
                        "id": "capital",
                        "description": "name of capital city"
                    },
                    {
                        "id": "population",
                        "description": "number of people living in country"
                    }
                ]
            }
        ],
        "joins": [
            {
                "entities": [
                    "AS",
                    "Country"
                ],
                "description": "in"
            },
            {
                "entities": [
                    "Organization",
                    "Country"
                ],
                "label": "in"
            },
            {
                "entities": [
                    "Organization",
                    "AS"
                ],
                "label": "member"
            },
            {
                "entities": [
                    "AS",
                    "AS Link IPv4"
                ]
            }
        ],
        "interfaces": [
            {
                "type": "UI",
                "url": "asrank.caida.org",
                "status": "public"
            },
            {
                "type": "API",
                "url": "asrank.caida.org/api",
                "status": "public"
            },
            {
                "type": "FILE",
                "name": "AS Relationships",
                "url": "http://www.caida.org/data/as-relationships/",
                "status": "public"
            },
            {
                "type": "FILE",
                "name": "Organization",
                "url": "http://www.caida.org/data/as-organizations/",
                "status": "public"
            }
        ],
        "licenses": [
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ],
        "description": "A ranking of the ASNs."
    },
    {
        "name": "Netacuity",
        "organization": "Digital Elements",
        "tags": [
            "geolocation"
        ],
        "joins": [
            {
                "entities": [
                    "IPv4 Address",
                    "City"
                ],
                "label": "in"
            },
            {
                "entities": [
                    "IPv6 Address",
                    "City"
                ],
                "label": "in"
            }
        ],
        "interfaces": [
            {
                "type": "WEB",
                "url": "www.digitalelement.com/solutions",
                "status": "commercial"
            }
        ],
        "licenses": [
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ],
        "description": "IP Geolocation Service"
    },
    {
        "name": "AS Relationship",
        "organization": "CAIDA",
        "tags": [
            "topology"
        ],
        "entities": [
            {
                "id": "IPv4 AS",
                "features": [
                    {
                        "id": "IPv4 customer cone",
                        "description": "number of ASN in it's customer cone"
                    },
                    {
                        "id": "IPv6 customer cone",
                        "description": "number of ASN in it's customer cone"
                    }
                ]
            },
            {
                "id": "IPv4 AS Link",
                "features": [
                    {
                        "id": "IPv4 relationship",
                        "description": "type of business relationship practiced on link"
                    },
                    {
                        "id": "IPv4 relationship",
                        "description": "type of business relationship practiced on link"
                    }
                ]
            }
        ],
        "joins": [
            {
                "entities": [
                    "AS Link",
                    "AS"
                ],
                "label": "on"
            }
        ],
        "interfaces": [
            {
                "type": "UI",
                "url": "ihr.iijlab.net/ihr",
                "status": "public"
            }
        ],
        "licenses": [
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ],
        "description": "Measures an AS's centrality"
    },
    {
        "name": "Internet Health Report",
        "organization": "IIJ Labs",
        "tags": [
            "topology"
        ],
        "entities": [
            {
                "id": "AS",
                "features": [
                    {
                        "id": "IPv4 hegemony",
                        "description": "measure of an AS's centrality"
                    }
                ]
            }
        ],
        "interfaces": [
            {
                "type": "UI",
                "url": "ihr.iijlab.net/ihr",
                "status": "public"
            }
        ],
        "description": "Measures an AS's centrality"
    },
    {
        "name": "ITDK",
        "organization": "CAIDA",
        "tags": [
            "topology"
        ],
        "joins": [
            {
                "entities": [
                    "Router",
                    "IPv4 Address"
                ],
                "label": "interface",
                "description": "IP address of router on a router"
            },
            {
                "entities": [
                    "Router",
                    "Router link"
                ]
            },
            {
                "entities": [
                    "Router",
                    "AS"
                ],
                "label": "operator",
                "description": "organization that maintains the router routing table"
            },
            {
                "entities": [
                    "Router",
                    "City"
                ],
                "label": "in",
                "description": "inferred from IXP address space, hostname, and then Netacuity"
            }
        ],
        "interfaces": [
            {
                "type": "FILE",
                "url": "https://www.caida.org/data/internet-topology-data-kit/",
                "status": "public"
            }
        ],
        "licenses": [
            {
                "name": "Maxmind Geolite2",
                "url": "https://dev.maxmind.com/geoip/geoip2/geolite2/",
                "description": "applies to router geographic locations"
            },
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ]
    },
    {
        "name": "BGPStream",
        "organization": "CAIDA",
        "logo": "http://www.caida.org/services/images/bgpstream-logo-black-blue.png",
        "tags": [
            "topology",
            "BGP"
        ],
        "joins": [
            {
                "entities": [
                    "AS",
                    "AS Path"
                ]
            },
            {
                "entities": [
                    "AS",
                    "AS Link"
                ]
            },
            {
                "entities": [
                    "AS",
                    "IPv4 Prefix"
                ],
                "label": "origin"
            },
            {
                "entities": [
                    "AS",
                    "IPv6 Prefix"
                ],
                "label": "origin"
            },
            {
                "entities": [
                    "IPv4 Prefix",
                    "AS Path"
                ]
            },
            {
                "entities": [
                    "IPv6 Prefix",
                    "AS Path"
                ]
            }
        ],
        "interfaces": [
            {
                "type": "API",
                "url": "https://bgpstream.caida.org/docs/api",
                "status": "public"
            }
        ],
        "licenses": [
            {
                "name": "RIPE NCC"
            },
            {
                "name": "Routeviews"
            }
        ],
        "description": "BGPStream is an open-source software framework for live and historical BGP data analysis, supporting scientific research, operational monitoring, and post-event analysis."
    },
    {
        "name": "HI-CUBE",
        "organization": "CAIDA",
        "logo": "http://www.caida.org/services/images/ioda-logo.svg",
        "tags": [
            "security"
        ],
        "joins": [
            {
                "entities": [
                    "IPv4 Address",
                    "Country"
                ]
            }
        ],
        "interfaces": [
            {
                "type": "UI",
                "url": "https://hicube.caida.org",
                "status": "restricted"
            }
        ],
        "licenses": [
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ],
        "description": "HI-CUBE is a web-based prototype platform for processing, storing, investigating, and correlating diverse streams of large-scale Internet security-related data."
    },
    {
        "name": "IODA",
        "organization": "CAIDA",
        "logo": "http://www.caida.org/services/images/ioda-logo.svg",
        "tags": [
            "security",
            "darknet",
            "outages"
        ],
        "joins": [
            {
                "entities": [
                    "IPv4 Address",
                    "Location"
                ]
            }
        ],
        "interfaces": [
            {
                "type": "UI",
                "url": "https://ioda.caida.org",
                "status": "public"
            }
        ],
        "licenses": [
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ],
        "description": "IODA is a CAIDA project to develop an operational prototype system that monitors the Internet, in near-realtime, to identify macroscopic Internet outages affecting the edge of the network, i.e., significantly impacting an AS or a large fraction of a country."
    },
    {
        "name": "MANIC",
        "organization": "CAIDA",
        "logo": "http://www.caida.org/services/images/manic_logo.png",
        "tags": [
            "congestion",
            "interdomain links"
        ],
        "entities": [
            {
                "id": "IPv4 Link",
                "features": [
                    {
                        "id": "outages",
                        "description": ""
                    },
                    {
                        "id": "RTT pairs",
                        "description": ""
                    }
                ]
            }
        ],
        "joins": [
            {
                "entities": [
                    "IPv4 Address",
                    "IPv4 Link"
                ]
            }
        ],
        "interfaces": [
            {
                "type": "UI",
                "url": "https://viz.manic.caida.org/login",
                "status": "restricted"
            },
            {
                "type": "API",
                "url": "https://api.manic.caida.org/v1/",
                "status": "restricted"
            }
        ],
        "licenses": [
            {
                "name": "CAIDA AUA (semi-restricted)",
                "url": "http://www.caida.org/home/legal/aua/"
            }
        ],
        "description": "The MANIC project -- Measurement and Analysis of Interdomain Congestion -- has developed a prototype system to monitor interdomain links and their congestion state, in order to provide empirical grounding to debates related to interdomain congestion."
    }
];

export default SearchJson;
