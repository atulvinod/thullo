export const constants = {
    "FILTER_NONE": "FILTER_NONE",
}

export const transformationConfigs = {
    "TYPES": { "FILTER": 'filter', "SORT": 'sort' },
    "BASIS": {
        "SORT":{
            "DATE": "DATE"
        }
    },
    "CONFIGS": {
        "SORT": {
            "DATE": {
                "RECENTLY_ADDED_ASC": "RECENTLY_ADDED_ASC",
                "RECENTLY_ADDED_DESC": "RECENTLY_ADDED_DESC",
                "RECENTLY_MODIFIED_ASC": "RECENTLY_MODIFIED_ASC",
                "RECENTLY_MODIFIED_DESC": "RECENTLY_MODIFIED_DESC",
                "SORT_NONE": "SORT_NONE"
            }
        },
    },
    "CONFIG_DEF": {
        "SORT": {
            "DATE": {
                "RECENTLY_ADDED_ASC": (x, y) => {
                    let dx = new Date(x.created).getTime()
                    let dy = new Date(y.created).getTime()
                    if (dx < dy) {
                        return 1
                    } else if (dx > dy) {
                        return -1
                    }
                    return 0
                },
                "RECENTLY_ADDED_DESC": (x, y) => {
                    let dx = new Date(x.created).getTime()
                    let dy = new Date(y.created).getTime()
                    if (dx < dy) {
                        return -1
                    } else if (dx > dy) {
                        return 1
                    }
                    return 0
                },
                "RECENTLY_MODIFIED_ASC": (x, y) => {
                    let dx = new Date(x.modified).getTime()
                    let dy = new Date(y.modified).getTime()
                    if (dx < dy) {
                        return 1
                    } else if (dx > dy) {
                        return -1
                    }
                    return 0
                },
                "RECENTLY_MODIFIED_DESC": (x, y) => {
                    let dx = new Date(x.modified).getTime()
                    let dy = new Date(y.modified).getTime()
                    if (dx < dy) {
                        return -1
                    } else if (dx > dy) {
                        return 1
                    }
                    return 0
                },
                "SORT_NONE": (x, y) => {
                    return 0
                }
            }

        }
    }

}