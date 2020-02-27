export const nodeDetailConfig = {
    method: "get",
    url: ""
};

export const getNodeDetail__Dataset = `... on%20 Dataset {
                            description%20
                            logo%20
                            organization%20
                            interfaces {
                                type%20
                                url%20
                                status
                            }
                            licenses {
                                name%20
                                url
                            }
                            joins {
                                name%20
                                label%20
                                entities {
                                    name
                                }
                                
                            }
                            entities {
                                name%20
                                features {
                                    name%20
                                    description
                                }
                            }
                        }`;

export const getNodeDetail__Entity = `... on%20 Entity {
                            description%20
                            features {
                                name%20
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

export const getNodeDetail__Join = `... on%20 Join {
                            label%20
                            datasets {
                                id
                            }
                            entities {
                                name%20
                                id%20
                                features {
                                    name%20
                                    description
                                }
                            }
                        }`;
