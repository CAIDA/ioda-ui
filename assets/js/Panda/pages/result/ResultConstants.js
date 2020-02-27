export const nodeDetailConfig = {
    method: "post",
    url: ""
};

export const getNodeDetail__Dataset = `... on Dataset {
                            description
                            logo
                            organization
                            interfaces {
                                type
                                url
                                status
                            }
                            licenses {
                                name
                                url
                            }
                            joins {
                                name
                                label
                                entities {
                                    name
                                }
                                
                            }
                            entities {
                                name
                                features {
                                    name
                                    description
                                }
                            }
                        }`;

export const getNodeDetail__Entity = `... on Entity {
                            description
                            features {
                                name
                                description
                            }
                            tags {
                                name
                            }
                            datasets {
                                id
                            }
                            joins {
                                id
                            }
                        }`;

export const getNodeDetail__Join = `... on Join {
                            label
                            datasets {
                                id
                            }
                            entities {
                                name
                                id
                                features {
                                    name
                                    description
                                }
                            }
                        }`;
