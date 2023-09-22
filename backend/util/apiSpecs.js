module.exports = {
    internal: {

    },
    external: {
        fetchFromDb: {
            query: {
                requiredKeys: ["id"],
                optionalKeys: ["txnDate"],
                validations: {
                    id: { type: "number", maxLength: 10, minLength: 5 },
                    txnDate: { type: "date" }
                }
            }
        },
        fetchFromRedis: {
            body: {
                requiredKeys: ["key"],
                validations: {
                    key: { type: "string", maxLength: 20, minLength: 2 },
                }
            }
        }
    }
}